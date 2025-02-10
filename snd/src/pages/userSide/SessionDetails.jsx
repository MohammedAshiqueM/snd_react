import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sessionDetails, followUnfollow, updateRequest, } from '../../api'; 
import { baseUrl, getCloudinaryUrl } from '../../constants/constant';
import { formatDistanceToNow,format } from 'date-fns';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg'
import { useAuthStore } from '../../store/useAuthStore';
import { Activity, AlertTriangle, Edit2, MoreVertical, X,Clock,Calendar, Tag} from 'lucide-react';
import SessionRequestModal from '../../components/SessionRequestModal';
import StatusDropdown from '../../components/StatusDropdown';
import ProposedSchedules from './ProposedSchedules';
import { getSchedulesForRequest } from '../../wsApi';
import ScheduleProposal from '../../components/ScheduleProposal';
import RequestCycleStatus from '../../components/RequestCycleStatus';

const StatusModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="relative max-w-2xl w-full mx-auto">
          <div className="relative bg-[#0A0B1A] rounded-xl shadow-xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors z-10"
            >
              <X size={18} />
            </button>
            {/* Content */}
            <div className="p-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const ErrorToast = ({ message, onDismiss }) => {
    if (!message) return null;
  
    return (
      <div className="fixed bottom-4 right-4 flex items-center bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right-2">
        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  };

export default function SessionDetails() {
  const { pk } = useParams();
  const [blog, setBlog] = useState(null);
  const { user } = useAuthStore();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
  const [schedules, setSchedules] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const navigate = useNavigate();

  const formatErrorMessage = (error) => {
    try {
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for duration_minutes error
        if (errorData.duration_minutes) {
          return errorData.duration_minutes[0];
        }
        
        const firstErrorField = Object.keys(errorData)[0];
        if (firstErrorField && Array.isArray(errorData[firstErrorField])) {
          return errorData[firstErrorField][0];
        }
      }
      
      if (error.duration_minutes && Array.isArray(error.duration_minutes)) {
        return error.duration_minutes[0];
      }
      
      return 'An error occurred. Please try again.';
    } catch (e) {
      console.error('Error formatting error message:', e);
      return 'An error occurred. Please try again.';
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdateLoading(true);
    setError(null);
    
    try {
      const updatedData = await updateRequest(pk, { status: newStatus });
      setBlog(prev => ({ ...prev, status: newStatus }));
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      setBlog(prev => ({ ...prev }));
    } finally {
      setUpdateLoading(false);
    }
  };
 
  const handleScheduleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      await updateScheduleStatus(scheduleId, newStatus);
      // Refresh schedules after update
    //   const updatedSchedules = await getSchedulesForRequest(pk);
    //   setSchedules(updatedSchedules);
    } catch (error) {
      console.error('Error updating schedule status:', error);
    }
  };
   const handleEditSuccess = (updatedData) => {
    setBlog(prev => ({
      ...prev,
      ...updatedData
    }));
    setIsEditModalOpen(false);
  };
//    const isOwner = blog?.user?.username === user.username;
//    const canSchedule = !isOwner && blog?.status === "PE" && !(blog?.has_proposed);
   
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
    let errorTimeout;
    if (error) {
      errorTimeout = setTimeout(() => {
        setError(null);
      }, 5000); // Auto-dismiss after 5 seconds
    }
    return () => clearTimeout(errorTimeout);
  }, [error]);

  useEffect(() => {
    async function loadBlog() {
      try {
        const sessionData = await sessionDetails(pk);
        setBlog(sessionData);
        setIsFollowing(sessionData.is_following);
      } catch (err) {
        console.error('Failed to load session details:', err);
        setError('Failed to load session details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadBlog();
  }, [pk]);

  if (loading) return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
  if (!blog) return null;

  const blogWriterImage = getCloudinaryUrl(blog.user.profile_image) || noUser;
  const isOwner = blog?.user?.username === user.username;
  const canSchedule = !isOwner && blog?.status === "PE" && !(blog?.has_proposed);

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
                  src={blogWriterImage}
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
              {!isOwner && <button
                className={`rounded px-3 py-1 text-sm font-medium ${
                  isFollowing ? "bg-[#840A0A] hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => handleFollowUnfollow(blog.user.id)}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>}
              {/* Progress Button */}
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Activity size={16} />
                View Progress
              </button>
            </div>
          </div>
                
          {/* Session Details Section */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="font-medium">{blog.duration_minutes} minutes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Preferred Time</p>
                  <p className="font-medium">{format(new Date(blog.preferred_time), 'PPp')}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map(({ tag }) => (
                  <span key={tag.id} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{blog.body_content}</p>
            </div>
          </div>

          {/* Action Buttons Section */}
          {isOwner && (
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition-all duration-200"
                disabled={updateLoading}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <StatusDropdown 
                currentStatus={blog.status}
                onStatusChange={handleStatusChange}
                isOwner={isOwner}
              />
              {updateLoading && (
                <span className="text-sm text-blue-400">
                  Updating status...
                </span>
              )}
            </div>
          )}

          {/* Schedule Section */}
          {isOwner && (
            <ProposedSchedules
              schedules={schedules}
              onStatusUpdate={handleScheduleStatusUpdate}
              requestId={pk}
            />
          )}
          
          {canSchedule && (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              Propose Schedule
            </button>
          )}
          
          {blog.has_proposed && (
            <div className="px-3 py-1 rounded-md text-sm bg-green-900/50 text-green-400 mt-4" style={{ maxWidth: 'fit-content' }}>
              Scheduled
            </div>
          )}
        </article>

        {/* Error Toast */}
        <ErrorToast 
          message={error} 
          onDismiss={() => setError(null)} 
        />

        {/* Modals */}
        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
        >
          <RequestCycleStatus 
            status={blog.status}
            scheduleData={{
              proposals_count: blog.schedule_proposals_count,
              accepted_schedule: blog.accepted_schedule
            }}
          />
        </StatusModal>

        {isEditModalOpen && (
          <SessionRequestModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialData={blog}
            mode="edit"
            onSuccess={handleEditSuccess}
          />
        )}

        {!isOwner && isScheduleModalOpen && (
          <ScheduleProposal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            requestId={blog.id}
            onScheduleProposed={() => {
              setIsScheduleModalOpen(false);
            }}
          />
        )}
      </main>
    </div>
  );
}