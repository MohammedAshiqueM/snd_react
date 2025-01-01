import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { blockUser, reportDetails } from "../../adminApi";
import NavbarAdmin from "../../components/NavbarAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import Paginator from "../../components/Paginator";
import useSearchStore from "../../store/useSearchStore";
import useSkillsStore from "../../store/useSkillStore";
import { Loader2 } from "lucide-react";

const ReportDetails = () => {
  const { pk } = useParams();
  const [reportData, setReportData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
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
        setIsBlocked(response.reported_user.status); // Set initial block status
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

  const handleBlockToggle = async () => {
    try {
      const response = await blockUser(pk);
      const updatedStatus = response.status === "blocked";
      setIsBlocked(updatedStatus);
      console.log(`${updatedStatus ? "Blocked" : "Unblocked"} user with ID:`, pk);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

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
          {error ? (
            <div className="max-w-3xl mx-auto mt-8 bg-red-500 text-white p-4 rounded-lg">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : reportData && (
            <>
              <div className="bg-[#223047] rounded-lg text-white">
                <div className="p-6 border-b border-slate-600">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                      Reports for {reportData.reported_user.username}
                    </h1>
                    <button
                      onClick={handleBlockToggle}
                      className={`rounded px-4 py-1 text-xs ${
                        isBlocked
                          ? "bg-indigo-900 text-indigo-300 hover:bg-indigo-800"
                          : "bg-indigo-600 text-indigo-100 hover:bg-indigo-500"
                      }`}
                    >
                      {isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {reportData.reports.map((report, index) => (
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReportDetails;