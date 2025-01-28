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
  X,
  Inbox,
  CalendarClock,
  UserCircle,
  MessageCircle,
  Timer
} from 'lucide-react';

export function ToggleButton({ isCollapsed, onToggle }) {
    return (
      <button
        onClick={onToggle}
        className={`absolute top-5 -right-4 bg-gradient-to-r from-indigo-500 to-purple-500 
                 text-white z-40 rounded-full p-1.5 shadow-lg hover:shadow-indigo-500/20 
                 transition-all duration-300 w-8 h-8 flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 w-1/2 h-full bg-[#0D0E21] left-0 "></div>

        {isCollapsed ? <ChevronRight className="w-4 h-4 relative z-10" /> : <ChevronLeft className="w-4 h-4 relative z-10" />}
      </button>
    );
  }
  
  
  export default function SideBar({ isCollapsed, onToggle }) {
    const location = useLocation();
  
    const isActive = (path) => location.pathname === path;
    const [isOpen, setIsOpen] = useState(false);
  
    const navItems = [
        { name: 'Home', path: '/home', icon: HomeIcon },
        { name: 'Questions', path: '/questions', icon: FileQuestion },
        { name: 'Requests', path: '/requests', icon: Inbox },
        { name: 'Schedules', path: '/schedules', icon: CalendarClock }, 
        { name: 'Account', path: '/account', icon: UserCircle },
        { name: 'Tags', path: '/tags', icon: Tag },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Messages', path: '/chat', icon: MessageCircle },
        { name: 'Session', path: '/sessions', icon: Timer },  
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
  
  
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-gradient-to-b from-[#0D0E21] to-[#1a1b2e] 
                 border-r border-t border-gray-800/50 z-50 transition-all duration-300 
                 ${isCollapsed ? 'w-16' : 'w-48'} hidden md:block`}
        >
        <div className="relative">
            <ToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />
        </div>
          <nav className="space-y-3 p-2 pt-14 h-full">
            {navItems.map((item, index) => (
              <Link to={item.path} key={index}>
                <button
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-all duration-300 
                         ${isActive(item.path)
                           ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white'
                           : 'text-gray-400 hover:bg-indigo-500/10 hover:text-white'
                         } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                >
                  <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'hidden'}`} />
                {!isCollapsed && (
                  <>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </>
                )}
                </button>
              </Link>
            ))}
          </nav>
        </aside>
      </>
    );
  }
  
