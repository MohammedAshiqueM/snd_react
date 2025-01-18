'use client'

import { Mic, Video, PhoneOff, Monitor, MoreHorizontal, Home, Mail, Users, MessageSquare, FileText, Settings, Bell } from 'lucide-react'
import SideBar from '../../components/SideBar'
import { useState } from 'react';
import SecondNavbar from '../../components/SecondNavbar';
import { useAuthStore } from '../../store/useAuthStore';
import { baseUrl } from "../../constants/constant";
import noUser from "../../assets/Images/no_user.jpg"
export default function VideoMeet() {
    const { user, clearAuth } = useAuthStore();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
            const savedState = localStorage.getItem('isSidebarCollapsed');
            return savedState ? JSON.parse(savedState) : false;
          });
    const handleSidebarToggle = () => {
        setIsSidebarCollapsed((prevState) => {
            const newState = !prevState;
            localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
            return newState;
        });
        };
  return (
    <div className="min-h-screen h-screen bg-gray-100 text-white flex flex-col">
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#0D0E21] border-b border-gray-800">
                <div className="flex h-16 items-center justify-between px-4">
                    <a href="/" className="text-xl font-bold text-white">
                        <span className="font-mono">&lt;/&gt;</span>Snd
                    </a>
                    {/* <button className="text-gray-400 mr-4 ml-auto" onClick={handleLogout}>
                        Logout
                    </button> */}
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
            </nav>

      {/* Main Content */}
      <div className={`flex-1 pt-14 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
      {/* Sidebar */}
      <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />
        <div className="relative h-full rounded-2xl overflow-hidden bg-white shadow-lg">
          {/* Video Feed */}
          <div className="absolute inset-0">
            <img 
            //   src={`${"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Uj0n9NXB5tgbAqQRLJmJJN1RNqSqP6.png"}`}
              alt="Video feed"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-full">
              <div className="w-6 h-6 bg-gray-400 rounded-full" />
              <span className="text-white text-sm">You</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm">Recording</span>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-center items-center space-x-4">
              <button className="p-4 bg-black/30 hover:bg-black/40 rounded-full text-white transition">
                <Mic size={24} />
              </button>
              <button className="p-4 bg-black/30 hover:bg-black/40 rounded-full text-white transition">
                <Video size={24} />
              </button>
              <button className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition">
                <PhoneOff size={24} />
              </button>
              <button className="p-4 bg-black/30 hover:bg-black/40 rounded-full text-white transition">
                <Monitor size={24} />
              </button>
            </div>
          </div>

          {/* Right Controls */}
          <div className="absolute bottom-4 right-4 space-y-2">
            <button className="p-2 bg-white rounded-full shadow-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </button>
            <button className="p-2 bg-[#d9ff39] rounded-full shadow-lg">
              <MoreHorizontal size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

