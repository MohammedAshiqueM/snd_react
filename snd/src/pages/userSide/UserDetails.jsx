import { useEffect, useState } from 'react';
import { 
  Star, Github, Mail, Flag, Linkedin, 
  Users, Clock, Award, UserCheck 
} from 'lucide-react';
import { followUnfollow, userDetails } from '../../api';
import { baseUrl } from '../../constants/constant';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import ReportModal from '../../components/ReportModal';
import noUser from '../../assets/Images/no_user.jpg';
import { useParams } from 'react-router-dom';

export default function UserDetails() {
  const [profile, setProfile] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const { pk } = useParams();

  const handleFollowUnfollow = async () => {
    try {
      await followUnfollow(pk);
      setProfile((prevProfile) => ({
        ...prevProfile,
        isFollowing: !prevProfile.isFollowing,
      }));
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userDetails(pk);
        setProfile(response);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, [pk]);

  if (!profile) {
    return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
  }

  const { 
    username, email, github_url, linkedin_url, about, 
    skills, first_name, last_name, profile_image,
    banner_image, rating = 0, time_balance,
    followers, following, isFollowing 
  } = profile;

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
        <main className="flex-1 pt-12 max-w-6xl mx-auto">
          {/* Banner and Profile Section */}
          <div className="relative">
            <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl overflow-hidden">
              <img
                src={banner_image ? `${baseUrl}${banner_image}` : "/placeholder.svg?height=256&width=1536"}
                alt="Profile banner"
                className="w-full h-full object-cover opacity-70"
              />
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex items-end">
                <div className="relative">
                  <img
                    src={profile_image ? `${baseUrl}${profile_image}` : noUser}
                    alt="Profile picture"
                    className="h-36 w-36 rounded-xl border-4 border-white object-cover -mt-16 shadow-xl"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Details Column */}
                <div className="col-span-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-2xl font-bold">{first_name} {last_name}</h1>
                        <span className="text-sm text-gray-400">@{username}</span>
                      </div>
                      <div className="flex items-center mt-2">
                        {renderStars(rating)}
                        {/* <span className="ml-2 text-sm text-gray-400">({rating.toFixed(1)})</span> */}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="text-red-400 hover:text-red-300 flex items-center"
                    >
                      <Flag className="mr-1" /> Report
                    </button>
                  </div>

                  <div className="space-y-2">
                    {github_url && (
                      <a 
                        href={github_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-2 text-gray-300 hover:text-white"
                      >
                        <Github className="h-5 w-5" />
                        <span>GitHub Profile</span>
                      </a>
                    )}
                    {linkedin_url && (
                      <a 
                        href={linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center space-x-2 text-gray-300 hover:text-white"
                      >
                        <Linkedin className="h-5 w-5" />
                        <span>LinkedIn Profile</span>
                      </a>
                    )}
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Mail className="h-5 w-5" />
                      <span>{email}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Column */}
                <div className="col-span-1 bg-[#1e2a3a] rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span>Followers</span>
                    </div>
                    <span className="font-bold">{followers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-green-400" />
                      <span>Following</span>
                    </div>
                    <span className="font-bold">{following || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <span>Time Balance</span>
                    </div>
                    <span className="font-bold">{time_balance} min</span>
                  </div>
                  <div className="mt-4">
                    <button
                      className={`w-full rounded-lg py-2 text-sm font-medium transition-colors ${
                        isFollowing 
                          ? "bg-red-600 hover:bg-red-700 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      onClick={handleFollowUnfollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
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
                  <Users className="h-6 w-6 mr-2 text-green-400" />
                  About Me
                </h2>
                <p className="text-gray-300">{about || 'No description available.'}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
  
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userData={profile}
      />
    </div>
  );
}