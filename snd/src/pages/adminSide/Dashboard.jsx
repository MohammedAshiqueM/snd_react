import { useState,useEffect } from 'react';
import { Search } from 'lucide-react'
import SidebarAdmin from '../../components/SidebarAdmin'
import NavbarAdmin from '../../components/NavbarAdmin'

function Dashboard() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('isSidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
      });
  const stats = [
    { name: "Tags", value: 40 },
    { name: "Users", value: 36 },
    { name: "Posts", value: 107 },
    { name: "Reported Users", value: 7 },
    { name: "Questions", value: 167 }
  ]
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const storedSidebarState = localStorage.getItem('isSidebarCollapsed');
    if (storedSidebarState !== null) {
        setIsSidebarCollapsed(JSON.parse(storedSidebarState));
    }

    // fetchUserSkills();
    // setSearchContext("blogs");
}, []);

  return (
    <div className="min-h-screen bg-slate-700">
        {/* Navbar */}
        <NavbarAdmin/>
        {/* Sidebar */}
        <SidebarAdmin
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />

      <div className={`flex-1 p-4 pt-40 transition-all duration-300 ${
                        isSidebarCollapsed ? 'ml-16' : 'ml-48'
                      }`}>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-slate-700">
          <div className="grid grid-cols-3 gap-6 mb-6">
            {stats.slice(0, 3).map((stat) => (
              <div
                key={stat.name}
                className="bg-[#5B6B86] rounded-lg p-6 text-center shadow-lg"
              >
                <h3 className="text-xl text-white mb-2">{stat.name}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.slice(3).map((stat) => (
              <div
                key={stat.name}
                className="bg-[#5B6B86] rounded-lg p-6 text-center shadow-lg"
              >
                <h3 className="text-xl text-white mb-2">{stat.name}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

