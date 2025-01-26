"use client"

import { Search, Home, Compass, User, Tag, MessageCircle, FileText, Clock, Timer } from "lucide-react"
import SecondNavbar from "../../components/SecondNavbar"
import SideBar from "../../components/SideBar"
import { useState } from "react";

export default function Account() {
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
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
      {/* Header */}
        <SecondNavbar/>
      

      <div className={`flex-1 pt-12 transition-all duration-300`}>
        {/* Sidebar */}
       <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />

        {/* Main Content */}
        <main className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold border-b border-gray-700 pb-2">Time Account</h1>
            <div className="flex space-x-8 mt-4">
              <span className="text-gray-400">Credited</span>
              <span className="text-gray-400">Debted</span>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-[#1a2735] rounded-lg p-6 max-w-md">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Time remaining</span>
                </div>
                <span>120 min</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Timer className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">Active</span>
                </div>
                <span>90 min</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-300">On hold</span>
                </div>
                <div className="text-right">
                  <div>30 min</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

