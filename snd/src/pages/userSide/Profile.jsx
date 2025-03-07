import { useEffect, useState } from 'react';
import { 
  Star, Github, Mail, Edit, Pen, Linkedin, 
  Clock, Users, UserCheck, MapPin, 
  Calendar, Award 
} from 'lucide-react';
import EditProfileModal from '../../components/EditProfileModal';
import { myProfile } from '../../api';
import { baseUrl, getCloudinaryUrl } from '../../constants/constant';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = (updatedData) => {
    setProfile(prevProfile => ({
      ...prevProfile,
      ...updatedData,
      // Handle special cases for images
      profile_image: updatedData.profile_image || prevProfile.profile_image,
      banner_image: updatedData.banner_image || prevProfile.banner_image,
      // Handle skills array
      skills: updatedData.skills || prevProfile.skills
    }));
  };


  if (!profile) {
    return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
  }

  const { 
    username, email, github_url, linkedin_url, about, 
    skills, first_name, last_name, profile_image, banner_image,
    rating = 0, time_balance, available_time, held_time,
    followers_count, following_count, last_active 
  } = profile;

  const profileImageUrl = getCloudinaryUrl(profile_image) || noUser;
  const bannerImageUrl = getCloudinaryUrl(banner_image) || "/placeholder.svg?height=256&width=1536";
  
  const renderStars = (rating) => {
    const totalStars = 5;
    const roundedRating = Math.round(rating);
    
    return [...Array(totalStars)].map((_, index) => (
      <Star 
        key={index} 
        className={`h-5 w-5 ${index < roundedRating 
          ? 'fill-yellow-400 text-yellow-400' 
          : 'text-gray-500'}`} 
      />
    ));
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B1A] to-[#1a2735] text-white flex flex-col">
      <SecondNavbar />
      <div className={`flex-1 pt-4 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main className="flex-1 transition-all duration-300 relative">
          {/* Banner and Profile Section */}
          <div className="relative w-full">
            <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
              <img
                src={bannerImageUrl}
                alt="Profile banner"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex items-end">
                <div className="relative">
                  <img
                    src={profileImageUrl}
                    alt="Profile picture"
                    className="h-36 w-36 rounded-xl border-4 border-white object-cover -mt-16 shadow-xl"
                  />
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Details Column */}
                <div className="col-span-1 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold">{first_name} {last_name}</h1>
                      <span className="text-sm text-gray-400">@{username}</span>
                    </div>
                    <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-400 mr-2">Session Rating:</span>
                            {renderStars(Number(rating))}
                        <span className="ml-2 text-sm text-gray-400">
                            ({rating ? Number(rating).toFixed(1) : 'N/A'})
                        </span>
                    </div>


                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{email}</span>
                    </div>
                    {github_url && (
                      <div className="flex items-center space-x-2">
                        <Github className="h-5 w-5 text-gray-400" />
                        <a href={github_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                          GitHub Profile
                        </a>
                      </div>
                    )}
                    {linkedin_url && (
                      <div className="flex items-center space-x-2">
                        <Linkedin className="h-5 w-5 text-gray-400" />
                        <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Column */}
                <div className="col-span-1 bg-[#1e2a3a] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span>Followers</span>
                    </div>
                    <span className="font-bold">{followers_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-green-400" />
                      <span>Following</span>
                    </div>
                    <span className="font-bold">{following_count || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span>Total Time</span>
                    </div>
                    <span className="font-bold">{time_balance} min</span>
                  </div>
                </div>

                {/* Skills Column */}
                <div className="col-span-1 bg-[#1e2a3a] rounded-xl p-4 space-y-3">
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Award className="h-6 w-6 mr-2 text-purple-400" />
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills?.map((skill, i) => (
                      <span 
                        key={i} 
                        className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="mt-8 bg-[#1e2a3a] rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-green-400" />
                  About Me
                </h2>
                <p className="text-gray-300">{about || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
  
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={profile}
        onUpdateSuccess={handleProfileUpdate}
      />
    </div>
  );
}