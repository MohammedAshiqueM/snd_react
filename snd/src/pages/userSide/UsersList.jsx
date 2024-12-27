import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import NavBar from "../../components/NavBar";
import useSearchStore from "../../store/useSearchStore";
import { usersList } from "../../api";
import { baseUrl } from "../../constants/constant";
import noUser from "../../assets/Images/no_user.jpg";
import Paginator from "../../components/Paginator";
import useSkillsStore from "../../store/useSkillStore";
import { useNavigate } from 'react-router-dom';

function UsersList() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [previousUsers, setPreviousUsers] = useState([]);
  const { skills } = useSkillsStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem("isSidebarCollapsed");
    return savedState ? JSON.parse(savedState) : false;
  });
  
  const {
    searchQuery,
    selectedCategory,
    currentPage,
    setSelectedCategory,
    setCurrentPage,
    setSearchContext,
  } = useSearchStore();
  
  const navigate = useNavigate();
  const usersPerPage = 20;

  const fetchUsers = async (page = currentPage, category = selectedCategory, query = searchQuery) => {
    const isPageChange = page !== currentPage;
    
    if (!isPageChange) {
      setIsLoading(true);
    }
    
    if (isPageChange) {
      setPreviousUsers(users);
    }

    try {
      const params = {
        page,
        limit: usersPerPage,
        category: category === "All" ? "" : category,
        search: query
      };
      const response = await usersList(params);
      
      setUsers(response.results || []);
      setTotalPages(response.total_pages || 
        (response.count ? Math.ceil(response.count / usersPerPage) : 1));
      
      setPreviousUsers([]);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(previousUsers);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && !isLoading) {
      setCurrentPage(newPage);
      fetchUsers(newPage, selectedCategory, searchQuery);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    setSearchContext("users");
  }, [setSearchContext]);

  useEffect(() => {
    if (searchQuery) {
      const matchingCategory = skills.find(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchingCategory && selectedCategory !== matchingCategory) {
        setSelectedCategory(matchingCategory);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchUsers(1, selectedCategory, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, skills]);

  const renderUsers = () => {
    const displayUsers = users.length > 0 ? users : previousUsers;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-[#2a2438] cursor-pointer transition-opacity duration-200 ${
              isLoading ? 'opacity-50' : 'opacity-100'
            }`}
            onClick={() => navigate(`/users/details/${user.id}`)}
          >
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <img
                src={
                  user.profile_image
                    ? `${baseUrl}${user.profile_image}`
                    : noUser
                }
                className="h-full w-full rounded-full object-cover"
                alt={user.username}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || "Unknown"}
              </h3>
              <p className="text-xs text-blue-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {user.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0B1A] flex flex-col">
      <NavBar searchQuery={searchQuery} />
      <div className="flex flex-1">
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        <main
          className={`flex-1 p-4 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          } pt-40`}
        >
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-4">
              {users.length} users {searchQuery && `matching "${searchQuery}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </div>
            {renderUsers()}
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default UsersList;