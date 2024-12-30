import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import useSearchStore from "../../store/useSearchStore";
import { usersList } from "../../api";
import Paginator from "../../components/Paginator";
import useSkillsStore from "../../store/useSkillStore";
import { reportList } from "../../adminApi";

export default function Reports() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
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
  const { skills } = useSkillsStore();
  const usersPerPage = 20;

  const fetchUsers = async (page, category, query) => {
    try {
      const params = {
        page,
        limit: usersPerPage,
        category,
        search: query,
      };
      const response = await reportList(params);
      setUsers(response.results.results || []);
      setTotalPages(
        response.total_pages ||
          (response.count ? Math.ceil(response.count / usersPerPage) : 1)
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalPages(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
      return newState;
    });
  };

  const handleBlockToggle = (userId, status) => {
    // Logic for blocking/unblocking user (API call)
    console.log(`${status === "blocked" ? "Unblocking" : "Blocking"} user with ID:`, userId);
  };

  useEffect(() => {
    setSearchContext("reports");
  }, [setSearchContext]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const matchingCategory =
        skills.find((skill) =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ) || "All";

      if (selectedCategory !== matchingCategory) {
        setSelectedCategory(matchingCategory);
      }

      fetchUsers(currentPage, matchingCategory, searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, selectedCategory, searchQuery, skills]);

  return (
    <div className="min-h-screen bg-slate-700 flex flex-col">
      <NavbarAdmin />
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
            <div className="text-sm text-gray-500 mb-4">
              {users.length} users {searchQuery && `matching "${searchQuery}"`}
            </div>
          <div className="rounded-lg bg-slate-700 p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600 text-left">
                    <th className="pb-3 text-sm font-semibold text-slate-300">Name</th>
                    <th className="pb-3 text-sm font-semibold text-slate-300">Reports</th>
                    <th className="pb-3 text-sm font-semibold text-slate-300">Details</th>
                    <th className="pb-3 text-sm font-semibold text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-600 last:border-none">
                      <td className="py-3 text-sm text-slate-300">{user.reported_user__username}</td>
                      <td className="py-3 text-sm text-slate-300">{user.report_count}</td>
                      <td className="py-3">
                        <button className="rounded bg-slate-600 px-4 py-1 text-xs text-slate-300 hover:bg-slate-500">
                          Details
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleBlockToggle(user.id, user.status)}
                          className={`rounded px-4 py-1 text-xs ${
                            user.status === "blocked"
                              ? "bg-indigo-900 text-indigo-300 hover:bg-indigo-800"
                              : "bg-indigo-600 text-indigo-100 hover:bg-indigo-500"
                          }`}
                        >
                          {user.status === "blocked" ? "Unblock" : "Block"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
