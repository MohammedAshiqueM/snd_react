import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import useSearchStore from "../../store/useSearchStore";
import { usersList } from "../../api";
import Paginator from "../../components/Paginator";
import useSkillsStore from "../../store/useSkillStore";
import { reportDetails, reportList } from "../../adminApi";

export default function ReportsDetails() {
  const { pk } = useParams();
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
      const response = await reportDetails(params);
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
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
      <div className="report-details-container p-5 bg-[#2e3b4e] text-white rounded-lg max-w-3xl mx-auto">
        <div className="header flex justify-between items-center mb-4">
          {/* <h2 className="text-xl font-bold">Reports for {reportedUser.username}</h2> */}
          <button className="block-button bg-red-500 text-white border-none px-4 py-2 rounded-md cursor-pointer hover:bg-red-600">
            Block
          </button>
        </div>
        <div className="report-list">
          {reports.map((report, index) => (
            <div key={index} className="report-card bg-[#3e4c5e] p-4 rounded-lg mb-4">
              <p>
                <strong>Reported by:</strong> {report.reported_by.username}
              </p>
              <p>{report.note}</p>
              <p>
                <small>
                  <strong>Date:</strong> {new Date(report.created_at).toLocaleDateString()}
                </small>
              </p>
            </div>
          ))}
        </div>
        <div className="pagination text-center mt-5">
          {/* Include pagination controls */}
        </div>
      </div>
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
