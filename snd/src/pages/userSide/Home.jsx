import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Search, Share2, ChevronUp, ChevronDown, Pen, X } from 'lucide-react';
import { getBlogs, userSkills } from '../../api';
import { useNavigate } from 'react-router-dom';
import BlogWriteModal from '../../components/BlogWriteModal';
import { baseUrl } from '../../constants/constant';
import useSearchStore from "../../store/useSearchStore";
import noUser from '../../assets/Images/no_user.jpg';
import blogDefault from '../../assets/Images/blogDefault.png';
import SideBar from '../../components/SideBar';
import NavBar from '../../components/NavBar';
import Paginator from '../../components/Paginator';
import useSkillsStore from '../../store/useSkillStore';
import Shimmer from './Shimmer';
import { useAuthStore } from '../../store/useAuthStore';

const Home = () => {
    const [votes, setVotes] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('isSidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
      });

    const { searchQuery, selectedCategory, currentPage, setSelectedCategory, setCurrentPage, setSearchContext } = useSearchStore();
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const { skills } = useSkillsStore();  
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, loading: authLoading } = useAuthStore();
    const blogsPerPage = 12;

    const [showWelcome, setShowWelcome] = useState(() => {
        const savedState = localStorage.getItem('hideWelcome');
        return !savedState; // Show welcome if not hidden
    });

    // Function to handle welcome section close
    const handleWelcomeClose = () => {
        setShowWelcome(false);
        localStorage.setItem('hideWelcome', 'true');
    };

    // Voting logic
    const handleVote = (postId, voteType) => {
        setVotes(prev => {
            const currentVote = prev[postId] || 0;
            if (currentVote === voteType) {
                const newVotes = { ...prev };
                delete newVotes[postId];
                return newVotes;
            }
            return { ...prev, [postId]: voteType };
        });
    };

    // Fetch blogs
    const fetchBlogs = async (page = currentPage, category = selectedCategory, query = searchQuery) => {
        setIsLoading(true);
        
        try {
            const params = { page, limit: blogsPerPage, category, search: query };
            const response = await getBlogs(params);
            setPosts(response.data);
            setTotalPages(response.total_pages || 1);
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setPosts([]);
            setTotalPages(1);
        }finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = newPage => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            fetchBlogs(newPage, selectedCategory, searchQuery);
        }
    };

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
        setSearchContext("blogs");
    }, []);
    
    // In your Home component, modify the useEffect like this:
useEffect(() => {
    const initializeData = async () => {
        setIsLoading(true);
        try {
            if (searchQuery) {
                const matchingCategory = skills.find(skill =>
                    skill.toLowerCase().includes(searchQuery.toLowerCase())
                );
                const categoryToFetch = matchingCategory || "All";
                if (selectedCategory !== categoryToFetch) {
                    setSelectedCategory(categoryToFetch);
                }
                await fetchBlogs(1, categoryToFetch, searchQuery);
            } else {
                await fetchBlogs(1, selectedCategory, "");
            }
        } catch (error) {
            console.error("Error initializing data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    setSearchContext("blogs");
    initializeData();
}, [searchQuery, selectedCategory, skills]);
    
    

return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0B1A] to-[#1A1B2E] flex flex-col">
            <NavBar
                searchQuery={searchQuery}
                onWriteClick={() => setIsEditModalOpen(true)}
                writeButtonLabel="Write Blog"
            />

            <div className="flex flex-1">
                <SideBar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                
                <main className={`flex-1 p-6 pt-40 transition-all duration-300 ${
                    isSidebarCollapsed ? 'ml-16' : 'ml-48'
                }`}>
                    {/* Enhanced Welcome Section */}
                    {showWelcome && (
                        <div className="relative mb-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl p-8 border border-indigo-500/20 overflow-hidden group">
                            {/* Animated Background Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                            
                            <button 
                                onClick={handleWelcomeClose}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            
                            <div className="relative">
                                <h1 className="text-3xl font-bold text-white mb-4">Welcome to the Snd Tech Community</h1>
                                <p className="text-gray-300 max-w-2xl">Share your knowledge, discover new perspectives, and connect with fellow tech enthusiasts.</p>
                            </div>
                        </div>
                    )}

                    {(isLoading || authLoading) ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: blogsPerPage }).map((_, index) => (
                                <Shimmer key={index} />
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {posts.map((post, i) => (
                                <div
                                    key={i}
                                    className="group relative rounded-xl border border-gray-800 bg-gradient-to-b from-[#0D0E21] to-[#151632] p-4 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer transform hover:-translate-y-1"
                                    onClick={() => navigate(`/blogs/${post.slug}`)}
                                >
                                    {/* Enhanced Image Container */}
                                    <div className="relative aspect-video overflow-hidden rounded-lg">
                                        <img
                                            src={post.image ? `${baseUrl}${post.image}` : blogDefault}
                                            alt={post.title || 'Untitled'}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    
                                    <div className="mt-4 space-y-3">
                                        {/* Enhanced Title */}
                                        <h3 className="font-semibold text-white truncate text-lg group-hover:text-indigo-400 transition-colors">
                                            {post.title || 'Untitled Post'}
                                        </h3>
                                        
                                        {/* Enhanced Tags */}
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map((tagObj, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full transition-all duration-300 hover:bg-indigo-500/20 hover:text-white"
                                                >
                                                    {tagObj.tag.name}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Enhanced Author and Interaction Section */}
                                        <div className="mt-4 flex items-center justify-between flex-wrap">
                                            <div className="flex items-center gap-3 max-w-[60%]">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                                                    <div className="h-full w-full rounded-full bg-[#0D0E21] p-0.5 overflow-hidden">
                                                        <img
                                                            src={post.user?.profile_image ? `${baseUrl}${post.user.profile_image}` : noUser}
                                                            alt={post.user?.first_name || 'Unknown'}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    </div>
                                                </div>
                                                <span 
                                                    className="text-sm text-gray-300 truncate hover:text-indigo-400 transition-colors"
                                                    title={post.user?.first_name || 'Unknown Author'}
                                                >
                                                    {post.user?.first_name || 'Unknown Author'}
                                                </span>
                                            </div>
                                            
                                            {/* Enhanced Interaction Buttons */}
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="flex items-center gap-0.5 bg-[#1A1B2E] rounded-lg p-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVote(post.id, 1);
                                                        }}
                                                        className={`p-1.5 rounded-md transition-all ${
                                                            votes[post.id] === 1 
                                                                ? 'text-indigo-400 bg-indigo-500/20' 
                                                                : 'hover:bg-indigo-500/10 hover:text-indigo-400'
                                                        }`}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-xs px-2 min-w-[24px] text-center font-medium">
                                                        {(post.vote_count || 0) + (votes[post.id] || 0)}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleVote(post.id, -1);
                                                        }}
                                                        className={`p-1.5 rounded-md transition-all ${
                                                            votes[post.id] === -1 
                                                                ? 'text-red-400 bg-red-500/20' 
                                                                : 'hover:bg-red-500/10 hover:text-red-400'
                                                        }`}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                
                                                <button 
                                                    className="flex items-center gap-1 hover:text-indigo-400 transition-colors p-1.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">{post.comment_count || 0}</span>
                                                </button>
                                                
                                                <button 
                                                    className="hover:text-indigo-400 transition-colors p-1.5"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Share2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[50vh] bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-2xl border border-indigo-500/20">
                            <div className="w-16 h-16 mb-4 text-indigo-400">
                                <Pen className="w-full h-full" />
                            </div>
                            <p className="text-xl font-medium text-white">No blogs found</p>
                            <p className="text-sm mt-2 text-gray-400">Be the first one to write a blog!</p>
                        </div>
                    )}
                    
                    <div className="mt-8">
                        <Paginator
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(newPage) => {
                                if (newPage >= 1 && newPage <= totalPages) {
                                    setCurrentPage(newPage);
                                    fetchBlogs(newPage, selectedCategory, searchQuery);
                                }
                            }}
                        />
                    </div>
                </main>
            </div>

            <BlogWriteModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </div>
    );
};

export default Home;
