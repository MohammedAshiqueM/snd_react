import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SideBar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-48 border-r border-gray-800 bg-[#0D0E21] p-4 md:block h-full">
          <nav className="space-y-2">
            {["Home", "Discover", "Account", "Tags", "Users", "Messages", "Requests"].map(
              (item, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-800 hover:text-white rounded-md"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </aside>
    </div>
  )
}

{/* <aside className="w-48 p-4 border-r border-gray-700">
          <nav className="space-y-4">
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Compass className="h-5 w-5" />
              <span>Discover</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <User className="h-5 w-5" />
              <span>Account</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Tag className="h-5 w-5" />
              <span>Tags</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <Users className="h-5 w-5" />
              <span>Users</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <MessageSquare className="h-5 w-5" />
              <span>Messages</span>
            </a>
            <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-white">
              <FileQuestion className="h-5 w-5" />
              <span>Requests</span>
            </a>
          </nav>
        </aside> */}

