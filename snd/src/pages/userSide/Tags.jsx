import { useEffect, useState } from "react";
import useSearchStore from "../../store/useSearchStore";
import useSkillsStore from "../../store/useSkillStore";
import Paginator from "../../components/Paginator";
import { tagList } from "../../adminApi";
import { Copy } from 'lucide-react'
import NavBar from "../../components/NavBar";
import SideBar from "../../components/SideBar";

export default function Tags() {
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
        if (searchQuery) {
          const matchingCategory = skills.find((skill) =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const categoryToFetch = matchingCategory || "All";
          
          if (selectedCategory !== categoryToFetch) {
            setSelectedCategory(categoryToFetch);
          }
          await fetchTags(currentPage, categoryToFetch, searchQuery);
        } else {
          await fetchTags(currentPage, selectedCategory, "");
        }
      };

      fetchWithCategory();
    }, 300);

    return () => clearTimeout(timeoutId);
}, [currentPage, selectedCategory, searchQuery, skills]);

  useEffect(() => {
    setSearchContext("tags");
  }, [setSearchContext]);
  return (
    <div className="min-h-screen bg-[#0A0B1A] text-gray-100">
      <NavBar />
      <div className="flex flex-1">
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />

        {/* Main Content */}
        <main 
        className={`flex-1 p-4 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          } pt-32`}
        >
          <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-500 mb-4">
              {tags.length} tags {searchQuery && `matching "${searchQuery}"`}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="text-white text-center py-4">Loading...</div>
            ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
            ) : tags.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                <div
                    key={tag.id}
                    className="bg-gray-800 p-4 rounded-lg relative group hover:ring-2 hover:ring-gray-700 transition-all"
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
          {/* Pagination */}
          <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
        </main>
      </div>
    </div>
  )
}

