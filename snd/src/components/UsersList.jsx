import { useEffect, useState } from 'react';
import { Search, Home, Compass, User, Tag, Users, MessageSquare, FileQuestion } from 'lucide-react';
import SideBar from './SideBar';
import NavBar from './NavBar';
import useSearchStore from '../store/useSearchStore';
import { usersList } from '../api';
import { baseUrl } from '../constants/constant';
import noUser from '../assets/Images/no_user.jpg'
import Paginator from './Paginator';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
      // Retrieve state from localStorage if available
      const savedState = localStorage.getItem('isSidebarCollapsed');
      return savedState ? JSON.parse(savedState) : false;
    });
    const {
      searchQuery,
      selectedCategory,
      currentPage,
      setSearchQuery,
      setSelectedCategory,
      setCurrentPage,
      setSearchContext
    } = useSearchStore();
    const usersPerPage = 20;
    const url = baseUrl;

    const fetchUsers = async (page = currentPage, category = selectedCategory, query = searchQuery) => {
      try {
        const response = await usersList({
          page,
          limit: usersPerPage,
          category,
          search: query
        });

        console.log('Users fetch response:', response);

        setUsers(response.results || []);
        const totalPagesCalculated = response.total_pages ||
          (response.count ? Math.ceil(response.count / usersPerPage) : 1);

        setTotalPages(totalPagesCalculated);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setTotalPages(1);
      }
    };

    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      fetchUsers(newPage, selectedCategory, searchQuery);
    };

    const handleSearch = (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
    };

    const handleSidebarToggle = () => {
      setIsSidebarCollapsed((prevState) => {
        const newState = !prevState;
        localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
        return newState;
      });
    };

    // Fetch users when page, category, or search query changes
    useEffect(() => {
      fetchUsers();
    }, [currentPage, selectedCategory, searchQuery]);

    // Set search context on component mount
    useEffect(() => {
      setSearchContext('users');
    }, []);

    // Filter users client-side as a backup
    const filteredUsers = users.filter((user) =>
      (searchQuery === '' ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

    return (
      <div className="min-h-screen bg-[#0A0B1A] flex flex-col">
        <NavBar onSearch={handleSearch} searchQuery={searchQuery} />
        <div className="flex flex-1">
          <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
          <main className={`flex-1 p-4 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} pt-40`}>
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-4">
                {filteredUsers.length} users {searchQuery && `matching "${searchQuery}"`}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#2a2438]">
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <img
                        src={user.profile_image ? `${url}${user.profile_image}` : noUser}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user.username || "Unknown"}
                      </h3>
                      <p className="text-xs text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </main>
        </div>
      </div>
    );
}

export default UsersList;
