import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, Tag, Users, MessageSquare, FileQuestion, Menu, X } from 'lucide-react';

export default function SideBar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Discover', path: '/questions', icon: Compass },
    { name: 'Account', path: '/account', icon: User },
    { name: 'Tags', path: '/tags', icon: Tag },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Requests', path: '/requests', icon: FileQuestion },
  ];

  return (
    <div>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="text-white bg-gray-800 p-2 rounded-md">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sliding Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#0D0E21] border-r border-gray-800 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-40`}
      >
        <nav className="space-y-2 p-4">
          {navItems.map((item, i) => (
            <Link to={item.path} key={i} onClick={() => setIsOpen(false)}>
              <button
                className={`flex items-center w-full px-4 py-2 text-left rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.name}
              </button>
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-48 border-r border-gray-800 bg-[#0D0E21] p-4 h-full">
        <nav className="space-y-2">
          {navItems.map((item, i) => (
            <Link to={item.path} key={i}>
              <button
                className={`w-full px-4 py-2 text-left rounded-md ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            </Link>
          ))}
        </nav>
      </aside>
    </div>
  );
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

