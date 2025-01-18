import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Search, ChevronLeft, ChevronRight, Pen } from "lucide-react";
import {useAuthStore} from "../store/useAuthStore";
import useSearchStore from "../store/useSearchStore";
import { baseUrl } from "../constants/constant";
import { logoutUser, userSkills } from "../api";
import noUser from "../assets/Images/no_user.jpg";
import useSkillsStore from "../store/useSkillStore";
import WebSocketNotification from "./WebSocketNotification";

const NavBar = ({ onWriteClick, writeButtonLabel = "Write", writeButtonIcon = Pen }) => {
  const { user, clearAuth } = useAuthStore();
  const { skills, fetchSkills } = useSkillsStore();
  const {
    setSearchQuery,
    searchContext,
    selectedCategory,
    setSelectedCategory,
    setSearchContext,
  } = useSearchStore();
//   const [skills, setSkills] = useState(["All"]);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const WriteIcon = writeButtonIcon;

  // Map routes to contexts
  const pathToContextMap = {
    "/home": "blogs",
    "/questions": "questions",
    "/users": "users",
    "/requests": "requests",
    "/schedules":"schedules"
  };

  useEffect(() => {
    fetchSkills(); // Fetch skills only once
    setSelectedCategory("All"); // Default to "All" category on initial load
  }, [fetchSkills]);

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (!value.trim()) {
        setSearchQuery(""); // Reset search query if input is empty
        setSelectedCategory("All"); // Clear the selected category
      }
  };

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchInput.trim()) {
      // Check if the search query matches a category
      const matchedCategory = skills.find((skill) =>
        skill.toLowerCase() === searchInput.trim().toLowerCase()
      );
  
      if (matchedCategory) {
        setSelectedCategory(matchedCategory); // Select the matched category
      } else {
        if (selectedCategory === "All") {
            // If currently on "All", you might want to keep it that way
            setSelectedCategory("All");
          }
      }
  
      // Set the search query
      setSearchQuery(searchInput.trim());
  
      // Navigate based on search context
      const route = Object.keys(pathToContextMap).find(
        (key) => pathToContextMap[key] === searchContext
      );
      if (route) navigate(route);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      clearAuth();
      if (socket) {
        socket.close(1000, 'User logged out');
        setSocket(null);
      }
      setNotifications([]);
      setUnreadCount(0);
      alert("Logged out successfully!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to log out.");
    }
  };

  // Update search context based on route
  useEffect(() => {
    setSearchContext(pathToContextMap[location.pathname] || "blogs");
    console.log("......................................",user.profile_image)
  }, [location.pathname, setSearchContext]);

//   useEffect(() => {
//     fetchUserSkills();
//   }, [fetchUserSkills]);

  // Render skill buttons
  const renderSkillButtons = skills.map((skill) => (
    <button
      key={skill}
      onClick={() => {
        if (skill === "All") {
          setSearchInput("");
          setSearchQuery("");
        }
        setSelectedCategory(skill);
      }}
      className={`px-4 py-2 rounded-lg transition duration-300 ${
        selectedCategory === skill ? "text-white bg-gray-700 shadow-md" : "text-gray-400 hover:text-white"
      }`}
    >
      {skill}
    </button>
  ));

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0D0E21] border-b border-gray-800">
        <div className="flex h-16 items-center justify-between px-4">
          <a href="/" className="text-xl font-bold text-white">
            <span className="font-mono">&lt;/&gt;</span>Snd
          </a>
          <div className="flex flex-1 items-center px-8">
            <div className="relative w-full max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${searchContext}`}
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                className="border border-gray w-full rounded-md bg-gray-800/50 px-4 py-2 pl-10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="text-gray-400 mr-4" onClick={handleLogout}>
            Logout
          </button>
          
          <div className="flex items-center gap-4">
            {/* <button className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
              <Bell className="h-5 w-5" />
            </button> */}
            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
            <WebSocketNotification userId={user.id} />
            </button>
            <a href="/profile">
              <div className="h-8 w-8 rounded-full bg-gray-700">
                {user && (
                    
                  <img
                    src={user.profile_image ? `${baseUrl}${user.profile_image}` : noUser}
                    alt={user.first_name || "Untitled"}
                    className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
            </a>
          </div>
        </div>
      </nav>

      {/* Category Navigation */}
      <div className="fixed top-16 left-0 w-full z-40 bg-[#0A0B1A]/70 backdrop-blur-sm border-b border-gray-800 shadow-md animate-fadeIn">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex justify-center px-4 mx-auto space-x-4">
            <button className="p-1 text-gray-500 hover:text-white transition duration-200">
              <ChevronLeft className="h-5 w-5" />
            </button>
            {renderSkillButtons}
            <button className="p-1 text-gray-500 hover:text-white transition duration-200">
              <ChevronRight className="h-5 w-5" />
            </button>
            {onWriteClick && (
              <button
                onClick={onWriteClick}
                className="flex items-center text-white hover:text-[#4D7EF2] transition duration-300 absolute right-10"
              >
                <WriteIcon className="mr-1" /> {writeButtonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(NavBar);
