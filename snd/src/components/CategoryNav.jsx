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