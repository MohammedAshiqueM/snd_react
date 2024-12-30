import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { reportDetails } from "../../adminApi";
import NavbarAdmin from "../../components/NavbarAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import Paginator from "../../components/Paginator";
import useSearchStore from "../../store/useSearchStore";
import useSkillsStore from "../../store/useSkillStore";

const ReportDetails = () => {
  const { pk } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        const response = await reportDetails(pk);
        setReportData(response);
        setError(null);
      } catch (err) {
        setError("Failed to load report details");
        console.error("Error fetching report details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [pk]);
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
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 bg-red-500 text-white p-4 rounded-lg">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!reportData) return null;

  const { reported_user, reports } = reportData;

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
      <div className="bg-[#223047] rounded-lg text-white">
        <div className="p-6 border-b border-slate-600">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              Reports for {reported_user.username}
            </h1>
            <button 
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors"
              onClick={() => console.log(`Blocking user ${reported_user.id}`)}
            >
              Block User
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="bg-[#2A3D59] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    Reported by: {report.reported_by.username}
                  </span>
                  <span className="text-sm text-gray-400">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-200">{report.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
        <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
      </main>
    </div>
    </div>
  );
};

export default ReportDetails;