import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronLeft, ChevronRight, Pen, LogOut } from "lucide-react";
import {useAuthStore} from "../store/useAuthStore";
import useSearchStore from "../store/useSearchStore";
import { baseUrl } from "../constants/constant";
import { logoutUser, userSkills } from "../api";
// import { useSearchContext } from "../context/searchContext";
import noUser from '../assets/Images/no_user.jpg'
import WebSocketNotification from "./WebSocketNotification";


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
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#0D0E21] to-[#1a1b2e]">
        <div className="flex h-16 items-center px-4 border-b border-gray-800/50">
          {/* Left Section */}
          <div className="flex items-center w-[200px]">
            <a href="/" className="text-xl font-bold">
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                &lt;/&gt; Snd
              </span>
            </a>
          </div>

        {/* Center Section */}
        <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md group">
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 w-[200px] justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg 
                       bg-gradient-to-r from-red-500/10 to-red-600/10 
                       hover:from-red-500 hover:to-red-600
                       text-gray-400 hover:text-white
                       border border-red-500/20 hover:border-red-500
                       transition-all duration-300 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm font-medium">Logout</span>
            </button>

            <button className="relative rounded-full p-2 text-gray-400 hover:text-white 
                           hover:bg-indigo-500/10 transition-all duration-300 group">
              <WebSocketNotification userId={user.id} />
            </button>

            <a href="/profile" className="block">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                <div className="h-full w-full rounded-full bg-[#0D0E21] p-0.5">
                  {user && (
                    <img
                      src={user.profile_image ? `${baseUrl}${user.profile_image}` : noUser}
                      alt={user.first_name || "Untitled"}
                      className="h-full w-full rounded-full object-cover 
                               transition-transform group-hover:scale-105"
                    />
                  )}
                </div>
              </div>
            </a>
          </div>
        </div>
      </nav>
    </>
    );
}