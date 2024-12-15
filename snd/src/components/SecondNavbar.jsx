import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronLeft, ChevronRight, Pen } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import useSearchStore from "../store/useSearchStore";
import { baseUrl } from "../constants/constant";
import { logoutUser, userSkills } from "../api";
import { useSearchContext } from "../context/searchContext";

export default function SecondNavbar({ 
    onWriteClick, 
    writeButtonLabel = "Write",
    writeButtonIcon = Pen 
}) {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

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

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-[#0D0E21] border-b border-gray-800">
                <div className="flex h-16 items-center justify-between px-4">
                    <a href="/" className="text-xl font-bold text-white">
                        <span className="font-mono">&lt;/&gt;</span>Snd
                    </a>
                    <button className="text-gray-400 mr-4 ml-auto" onClick={handleLogout}>
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
                                        src={`${baseUrl}${user.profile_image}` || "/default-image.jpg"}
                                        alt={user.first_name || "Untitled"}
                                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-105"
                                    />
                                )}
                            </div>
                        </a>
                    </div>
                </div>
            </nav>
        </>
    );
}