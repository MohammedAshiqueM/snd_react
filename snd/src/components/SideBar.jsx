import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home as HomeIcon,
  Compass,
  User,
  Tag,
  Users,
  MessageSquare,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export function ToggleButton({ isCollapsed, onToggle }) {
    return (
      <button
        onClick={onToggle}
        className={`fixed top-32 ${
          isCollapsed ? 'left-16' : 'left-48'
        } bg-[#0D0E21] border border-gray-800 text-gray-400 hover:text-white z-40 rounded transition-all duration-300 hidden md:block`}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    );
  }
  
  export default function SideBar({ isCollapsed, onToggle }) {
    const location = useLocation();
  
    const isActive = (path) => location.pathname === path;
    const [isOpen, setIsOpen] = useState(false);
  
    const navItems = [
      { name: 'Home', path: '/home', icon: HomeIcon },
      { name: 'Discover', path: '/questions', icon: Compass },
      { name: 'Account', path: '/account', icon: User },
      { name: 'Tags', path: '/tags', icon: Tag },
      { name: 'Users', path: '/users', icon: Users },
      { name: 'Messages', path: '/messages', icon: MessageSquare },
      { name: 'Requests', path: '/requests', icon: FileQuestion },
    ];
  
    return (
      <>
        {/* Mobile Hamburger */}
        <div className="md:hidden fixed top-20 left-4 z-50">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white bg-gray-800 p-2 rounded-md">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
  
        {/* Sliding Menu */}
        <div
          className={`fixed top-16 left-0 h-full w-64 bg-[#0D0E21] border-r border-gray-800 transform transition-transform duration-300 ${
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
  
        {/* Collapse/Expand Button Outside Sidebar */}
        <ToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />
  
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#0D0E21] border-r border-t border-gray-800 z-50 transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-48'
          } hidden md:block`}
        >
          <nav className="space-y-3 p-2 pt-14 h-full">
            {navItems.map((item, index) => (
              <Link to={item.path} key={index}>
                <button
                  className={`flex items-center w-full px-2 py-2 text-left rounded-md space-x-3 ${
                    isActive(item.path)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white text-base'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'hidden'}`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              </Link>
            ))}
          </nav>
        </aside>
      </>
    );
  }
  
