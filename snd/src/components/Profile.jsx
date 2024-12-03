import { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Github, Mail, Edit, Pen, Linkedin } from 'lucide-react';
import EditProfileModal from './EditProfileModal';
import { myProfile } from '../api';
// import { baseUrl } from './constants/constant';
import { baseUrl } from '../constants/constant';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const url = baseUrl
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myProfile()
        setProfile(response.data);
        // console.log(profile.profile_image)
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div>Loading...</div>;
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
    rating = 0,  // Provide default value
    time_balance,
    followers_count,
    following_count,
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

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white">
      <nav className="fixed left-0 top-0 h-full w-48 border-r border-gray-800 bg-[#0D0E21] p-4">
        <div className="mb-8 text-xl font-bold">
          <span className="font-mono">&lt;/&gt;</span>Snd
        </div>
        <div className="space-y-2">
          {['Home', 'Discover', 'Account', 'Tags', 'Users', 'Messages', 'Requests'].map((item) => (
            <button
              key={item}
              className="w-full rounded-lg px-3 py-2 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      <main className="ml-48">
        <div className="relative h-48 bg-gradient-to-r from-yellow-400 to-blue-600">
          <img
            src={banner_image || "/placeholder.svg?height=192&width=1024"}
            alt="Profile banner"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative px-8 pb-8">
          <div className="absolute top-[-12rem] flex items-end">
            <div className="relative">
              <img
                src={`${url}${profile_image}` || "/placeholder-avatar.svg"}
                alt="Profile picture"
                className="h-[11rem] w-[11rem] rounded-lg border-4 border-white object-cover" // Added visible border
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
                <button onClick={() => setIsEditModalOpen(true)} className="flex items-center hover:text-[#4D7EF2]">
                  <Pen className="mr-1" /> Edit
                </button>
              </h6>
              <span className="text-sm text-gray-400">@{username}</span>
              <div className="flex items-center">
                {renderStars(rating)}
                {/* <span className="ml-2 text-sm text-gray-400">({rating.toFixed(1)})</span> */}
              </div>
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
              <span>Followers: {followers_count?followers_count:0}</span>
              <span>Following: {following_count?following_count:0}</span>
              <span>Time Balance: {time_balance}</span>
              <span>Last Active: {new Date(last_active).toLocaleString()}</span>
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={profile}
      />
    </div>
  );
}