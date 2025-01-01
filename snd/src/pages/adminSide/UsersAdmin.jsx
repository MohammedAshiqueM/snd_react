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
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";

function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
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
  const url = baseUrl;

  const fetchUsers = async (page, category, query) => {
    try {
      const params = {
        page,
        limit: usersPerPage,
        category,
        search: query
      };
      const response = await usersList(params);
      setUsers(response.results || []);
      setTotalPages(response.total_pages || 
        (response.count ? Math.ceil(response.count / usersPerPage) : 1));
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalPages(1);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Sidebar toggle logic
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const fetchWithCategory = async () => {
        const matchingCategory =
          skills.find((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          ) || "All";

        if (selectedCategory !== matchingCategory) {
          setSelectedCategory(matchingCategory);
        }

        await fetchUsers(currentPage, matchingCategory, searchQuery);
      };

      fetchWithCategory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, selectedCategory, searchQuery, skills]);

  useEffect(() => {
    setSearchContext("users");
  }, [setSearchContext]);

  return (
    <div className="min-h-screen bg-slate-700 flex flex-col">
      <NavbarAdmin/>
      <div className="flex flex-1">
      <SidebarAdmin
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />
        <main
          className={`flex-1 p-4 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          } pt-32`}
        >
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-4">
              {users.length} users {searchQuery && `matching "${searchQuery}"`}
            </div>
            {isLoading ? (
              <div className="text-white text-center py-4">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#5B6B86]"
                    onClick={() => navigate(`/admin/user/details/${user.id}`)}

                  >
                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                      <img
                        src={
                          user.profile_image
                            ? `${url}${user.profile_image}`
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
            )}
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

export default UsersAdmin;