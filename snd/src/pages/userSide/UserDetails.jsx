import { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Github, Mail, Edit, Pen, Linkedin } from 'lucide-react';
import { followUnfollow, myProfile, userDetails } from '../../api';
// import { baseUrl } from './constants/constant';
import { baseUrl } from '../../constants/constant';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg'
import { useParams } from 'react-router-dom';
import ReportModal from '../../components/ReportModal';

export default function UserDetails() {
  const [profile, setProfile] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const { pk } = useParams();
  const url = baseUrl
  const handleFollowUnfollow = async () => {
    try {
      const response = await followUnfollow(pk);
      setProfile((prevProfile) => ({
        ...prevProfile,
        isFollowing: !prevProfile.isFollowing,
      }));
    //   console.log(response.data.message);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userDetails(pk)
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
    username, 
    email, 
    github_url, 
    linkedin_url,
    about, 
    skills, 
    first_name, 
    last_name,
    profile_image,
    banner_image,
    rating = 0, 
    time_balance,
    followers_count,
    following_count,
    isFollowing,
    last_active 
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
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
  <SecondNavbar />
  <div className={`flex-1 pt-4 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
    <SideBar
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
    />
    <main className="flex-1 pt-12">
      <div className="relative h-48 bg-gradient-to-r from-yellow-400 to-blue-600">
        <img
          src={`${url}${banner_image}` || "/placeholder.svg?height=192&width=1024"}
          alt="Profile banner"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative px-8 pb-8">
        <div className="absolute top-[-12rem] flex items-end">
          <div className="relative">
            <img
            //   src={`${url}${profile_image}` || "/placeholder-avatar.svg"}
              src={profile_image ? `${baseUrl}${profile_image}` : noUser}

              alt="Profile picture"
              className="h-[11rem] w-[11rem] rounded-lg border-4 border-white object-cover"
            />
            <button className="absolute right-2 top-2 rounded-full bg-gray-900/50 p-1 hover:bg-gray-900">
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-20">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{first_name} {last_name}</h1>
            <h6 className="absolute right-[3rem] flex items-center">
              <button onClick={() => setIsReportModalOpen(true)} className="flex items-center hover:text-[#4D7EF2]">
                <Pen className="mr-1" /> Report
              </button>
            </h6>
            <span className="text-sm text-gray-400">@{username}</span>
            <div className="flex items-center">
              {renderStars(rating)}
            </div>
            <button
                className={`rounded px-3 py-1 text-sm font-medium ${
                    isFollowing ? "bg-[#840A0A] hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={handleFollowUnfollow}
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </button>

          </div>
          <div className="mt-4 flex gap-4">
            {github_url && (
              <a href={github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </a>
            )}
            {linkedin_url && (
              <a href={linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn</span>
              </a>
            )}
            <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <Mail className="h-5 w-5" />
              <span>{email}</span>
            </a>
          </div>

          <div className="mt-4 flex gap-4 text-sm text-gray-400">
            <span>Followers: {followers_count ? followers_count : 0}</span>
            <span>Following: {following_count ? following_count : 0}</span>
            <span>Time Balance: {time_balance}</span>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">About</h2>
            <p className="text-gray-300">{about}</p>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill, i) => (
                <span key={i} className="rounded-full bg-gray-800 px-4 py-1 text-sm text-gray-300">
                  {skill}
                </span>
              ))}
            </div>
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