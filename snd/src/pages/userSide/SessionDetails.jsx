import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionDetails, followUnfollow, updateRequest } from '../../api'; 
import { baseUrl } from '../../constants/constant';
import { formatDistanceToNow } from 'date-fns';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg'
import { useAuthStore } from '../../store/useAuthStore';
import { Edit2, MoreVertical } from 'lucide-react';
import SessionRequestModal from '../../components/SessionRequestModal';
import StatusDropdown from '../../components/StatusDropdown';

export default function SessionDetails() {
  const { pk } = useParams();
  const [blog, setBlog] = useState(null);
  const { user } = useAuthStore();

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const url = baseUrl;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleStatusChange = async (newStatus) => {
    setUpdateLoading(true);
    setError(null);
    
    try {
      const updatedData = await updateRequest(pk, { status: newStatus });
      setBlog(prev => ({ ...prev, status: newStatus }));
      setShowStatusDropdown(false);
      // Optional: Show success message
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
      // Optionally revert the status in UI
      setBlog(prev => ({ ...prev }));
    } finally {
      setUpdateLoading(false);
    }
  };

   const handleEditSuccess = (updatedData) => {
    setBlog(prev => ({
      ...prev,
      ...updatedData
    }));
    setIsEditModalOpen(false);
  };
   const isOwner = blog?.user?.username === user.username;
   
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };
  
  const handleFollowUnfollow = async (userId) => {
    try {
      await followUnfollow(userId);
      setIsFollowing(prevState => !prevState);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  useEffect(() => {
    async function loadBlog() {
      try {
        const sessionData = await sessionDetails(pk);
        setBlog(sessionData);
        // Set the initial follow status from the API response
        setIsFollowing(sessionData.is_following);
      } catch (err) {
        console.error('Failed to load session details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadBlog();
  }, [pk]);
  
  if (loading) return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
  if (!blog) return null;

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
      <SecondNavbar/>
      <main className={`flex-1 pt-12 transition-all duration-300`}>
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <article className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="mb-8 flex items-center justify-between">
          
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden">
                <img 
                  src={blog.user.profile_image ? `${url}${blog.user.profile_image}` : noUser}
                  alt={blog.user.first_name || blog.user.username}
                  className="object-cover w-full h-full" 
                />
              </div>
              <div>
                <h3 className="font-semibold">
                  {blog.user.first_name && blog.user.last_name
                    ? `${blog.user.first_name} ${blog.user.last_name}`
                    : blog.user.username}
                </h3>
                <p className="text-sm text-gray-400">
                  Posted {formatDistanceToNow(new Date(blog.created_at))} ago
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isOwner && <button
                className={`rounded px-3 py-1 text-sm font-medium ${
                  isFollowing ? "bg-[#840A0A] hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => handleFollowUnfollow(blog.user.id)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>}
            </div>
          </div>
                
          <h1 className="mb-8 text-3xl font-bold">{blog.title}</h1>
          {isOwner && (
            <div className="flex items-center gap-4">
                <button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-all duration-200"
                >
                <Edit2 size={16} />
                Edit
                </button>
                <StatusDropdown 
                currentStatus={blog.status}
                onStatusChange={handleStatusChange}
                isOwner={isOwner}
                />
            </div>
            )}
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-gray-300">{blog.body_content}</p>
          </div>
        </article>
      </main>
      {isEditModalOpen && (
       <SessionRequestModal
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         initialData={blog}
         mode="edit"
         onSuccess={handleEditSuccess}
       />
     )}
    </div>
  );
}