import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import NavbarAdmin from "../../components/NavbarAdmin";
import useSearchStore from "../../store/useSearchStore";
import useSkillsStore from "../../store/useSkillStore";
import Paginator from "../../components/Paginator";
import { tagList } from "../../adminApi";
import { useNavigate } from "react-router-dom";
import { Copy } from 'lucide-react'
import AddTagModal from "../../components/AddTagModal";

export default function TagsAdmin() {
  const [tags, setTags] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const tagsPerPage = 20;

  const fetchTags = async (page, category, query) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: tagsPerPage,
        category,
        search: query,
      };
      const data = await tagList(params);
      setTags(data.results || []);
      setTotalPages(
        data.total_pages || (data.count ? Math.ceil(data.count / tagsPerPage) : 1)
      );
    } catch (err) {
      setError("Failed to fetch tags. Please try again.");
    } finally {
      setIsLoading(false);
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

        await fetchTags(currentPage, matchingCategory, searchQuery);
      };

      fetchWithCategory();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, selectedCategory, searchQuery, skills]);

  useEffect(() => {
    setSearchContext("tags");
  }, [setSearchContext]);

  return (
    <div className="min-h-screen bg-slate-700 text-gray-100 flex flex-col">
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
          <div className="mb-6">
            <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500 mb-4">
              {tags.length} tags {searchQuery && `matching "${searchQuery}"`}
            </div>
            <button className="bg-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors" onClick={() => setIsReportModalOpen(true)} >
              +Add Tag
            </button>
          </div>
          {isLoading ? (
            <div className="text-white text-center py-4">Loading...</div>
            ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
            ) : tags.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                <div
                    key={tag.id}
                    className="relative bg-[#404D64] p-4 rounded-lg group hover:bg-[#5B6B86] hover:ring-2 hover:ring-gray-700 transition-all"
                >
                    {/* Copy Button */}
                    <button
                    className="absolute right-2 top-2 p-2 bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigator.clipboard.writeText(tag.name)}
                    >
                    <Copy className="w-4 h-4 text-white" />
                    </button>
                    
                    {/* Tag Name and Description */}
                    <h3 className="text-lg font-semibold mb-2">{tag.name}</h3>
                    <p className="text-sm text-gray-400">
                    {tag.about || "No description available."}
                    </p>
                </div>
                ))}
            </div>
            ) : (
            <p className="text-center">No tags found.</p>
            )}

            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>
      <AddTagModal
  isOpen={isReportModalOpen}
  onClose={() => setIsReportModalOpen(false)}
//   userData={profile}
  />
    </div>
  );
}
