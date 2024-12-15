import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronLeft, ChevronRight, Pen } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useSearchStore from "../store/useSearchStore";
import { baseUrl } from "../constants/constant";
import { logoutUser, userSkills } from "../api";
import { useSearchContext } from "../context/searchContext";
import noUser from '../assets/Images/no_user.jpg'

export default function CateoryNav({ 
    onWriteClick, 
    writeButtonLabel = "Write",
    writeButtonIcon = Pen 
}) {
    const { user, clearAuth } = useAuthStore();
    const { 
        setSearchQuery, 
        searchContext, 
        selectedCategory, 
        setSelectedCategory 
    } = useSearchStore();
    const [skills, setSkills] = useState(['All']);
    const navigate = useNavigate();

    // Local state to manage the search input value
    const [searchInput, setSearchInput] = useState("");

    const fetchUserSkills = async () => {
        try {
            const response = await userSkills();
            setSkills(['All', ...response.data.skills]);
        } catch (err) {
            console.error('Failed to fetch skills:', err);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter" && searchInput.trim()) {
            setSearchQuery(searchInput.trim());
            
            switch (searchContext) {
                case "blogs":
                    navigate("/home");
                    break;
                case "questions":
                    navigate("/questions");
                    break;
                case "users":
                    navigate("/users")
                // default:
                //     navigate("/");
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            clearAuth();
            alert("Logged out successfully!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Failed to log out.");
        }
    };

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchInput(inputValue);
    
        // If input is empty, clear the search query
        if (inputValue === '') {
            setSearchQuery('');
        }
    };

    useEffect(() => {
        fetchUserSkills();
    }, []);

    const WriteIcon = writeButtonIcon;

    return (
        <>
            {/* Navbar */}
            {/* <nav className="fixed top-0 left-0 w-full z-50 bg-[#0D0E21] border-b border-gray-800">
                <div className="flex h-16 items-center justify-between px-4">
                    <a href="/" className="text-xl font-bold text-white">
                        <span className="font-mono">&lt;/&gt;</span>Snd
                    </a>
                    <div className="flex flex-1 items-center px-8">
                        <div className="justify-center mx-auto relative w-full max-w-lg">
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
                        <button className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                            <Bell className="h-5 w-5" />
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
            </nav> */}

            <div className="fixed top-16 left-0 w-full z-10 bg-[#0A0B1A]/70 backdrop-blur-sm border-b border-gray-800 shadow-md animate-fadeIn">
    {/* Category Navigation */}
    <div className="flex h-16 items-center justify-between px-4">
        <div className="flex justify-center px-4 mx-auto space-x-4">
            <button className="p-1 text-gray-500 hover:text-white transition duration-200">
                <ChevronLeft className="h-5 w-5" />
            </button>
            {skills.map((skill) => (
                <button
                    key={skill}
                    onClick={() => {
                        if (skill === 'All') {
                            setSearchInput('');
                            setSearchQuery('');
                        }
                        setSelectedCategory(skill);
                    }}
                    className={`px-4 py-2 rounded-lg transition duration-300 ${
                        selectedCategory === skill 
                            ? 'text-white bg-gray-700 shadow-md'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {skill}
                </button>
            ))}
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
}