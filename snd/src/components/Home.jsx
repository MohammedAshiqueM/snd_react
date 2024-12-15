import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Search, Share2, ChevronUp, ChevronDown, Pen } from 'lucide-react';
import { getBlogs, userSkills } from '../api';
import { useNavigate } from 'react-router-dom';
import BlogWriteModal from './BlogWriteModal';
import { baseUrl } from '../constants/constant';
import useSearchStore from "../store/useSearchStore";
import noUser from '../assets/Images/no_user.jpg';
import blogDefault from '../assets/Images/blogDefault.png';
import SideBar from './SideBar';
import NavBar from './NavBar';
import Paginator from './Paginator';

const Home = () => {
    const [votes, setVotes] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        // Retrieve state from localStorage if available
        const savedState = localStorage.getItem('isSidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
      });

    const { searchQuery, selectedCategory, currentPage, setSelectedCategory, setCurrentPage, setSearchContext } = useSearchStore();
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [skills, setSkills] = useState(['All']);

    const blogsPerPage = 12;

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
        try {
            const params = { page, limit: blogsPerPage, category, search: query };
            const response = await getBlogs(params);
            setPosts(response.data);
            setTotalPages(response.total_pages || 1);
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setPosts([]);
            setTotalPages(1);
        }
    };

    // Fetch user skills
    const fetchUserSkills = async () => {
        try {
            const response = await userSkills();
            setSkills(["All", ...response.data.skills]);
        } catch (err) {
            console.error("Error fetching skills:", err);
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
          // Save the state in localStorage whenever it changes
          const newState = !prevState;
          localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
          return newState;
        });
      };
    
      const handleSearch = (query) => {
        setCurrentPage(1);
        setSelectedCategory(
          skills.find(skill => skill.toLowerCase().includes(query.toLowerCase())) || 'All'
        );
      };

      useEffect(() => {
        const storedSidebarState = localStorage.getItem('isSidebarCollapsed');
        if (storedSidebarState !== null) {
            setIsSidebarCollapsed(JSON.parse(storedSidebarState));
        }
    
        fetchUserSkills();
        setSearchContext("blogs");
    }, []);
    
    useEffect(() => {
        if (searchQuery) {
            const matchingCategory = skills.find(skill =>
                skill.toLowerCase().includes(searchQuery.toLowerCase())
            );
    
            const categoryToFetch = matchingCategory || "All";
            if (selectedCategory !== categoryToFetch) {
                setSelectedCategory(categoryToFetch);
            }
            fetchBlogs(1, categoryToFetch, searchQuery);
        } else {
            fetchBlogs(1, selectedCategory, "");
        }
    }, [searchQuery, selectedCategory, skills]);
    
    

    return (
        <div className="min-h-screen bg-[#0A0B1A] flex flex-col">
            {/* Top Navigation */}
            <NavBar
                onSearch={handleSearch}
                searchQuery={searchQuery}
                onWriteClick={() => setIsEditModalOpen(true)}
                writeButtonLabel="Write Blog"
            />

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <SideBar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={handleSidebarToggle}
                />
                {/* Content Grid */}
                <main
                    className={`flex-1 p-4 pt-40 transition-all duration-300 ${
                        isSidebarCollapsed ? 'ml-16' : 'ml-48'
                      }`}
                >
                    {posts.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {posts.map((post, i) => (
                                <div
                                    key={i}
                                    className="group rounded-lg border border-gray-800 bg-[#0D0E21] p-4 transition-colors hover:border-gray-700"
                                    onClick={() => navigate(`/blogs/${post.slug}`)}
                                >
                                    <div className="relative aspect-video overflow-hidden rounded-lg">
                                        <img
                                            src={post.image ? `${baseUrl}${post.image}` : blogDefault}
                                            alt={post.title || 'Untitled'}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-white truncate">{post.title || 'Untitled Post'}</h3>
                                        <div className="flex space-x-2 pt-2">
                                            {post.tags.map((tagObj, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded"
                                                >
                                                    {tagObj.tag.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-700">
                                                    <img
                                                        src={post.user?.profile_image ? `${baseUrl}${post.user.profile_image}` : noUser}
                                                        alt={post.user?.first_name || 'Unknown'}
                                                        className="h-full w-full rounded-full"
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-400">{post.user?.first_name || 'Unknown Author'}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <div className="flex items-center gap-0.5 bg-[#1A1B2E] rounded-md p-0.5">
                                                    <button
                                                        onClick={() => handleVote(post.id, 1)}
                                                        className={`p-1 rounded ${votes[post.id] === 1 ? 'text-blue-500 bg-blue-500/10' : 'hover:bg-[#2A2B3E]'}`}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-xs px-1 min-w-[24px] text-center">
                                                        {(post.vote_count || 0) + (votes[post.id] || 0)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(post.id, -1)}
                                                        className={`p-1 rounded ${votes[post.id] === -1 ? 'text-red-500 bg-red-500/10' : 'hover:bg-[#2A2B3E]'}`}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <button className="flex items-center gap-1 hover:text-white">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span className="text-xs">{post.comments || 0}</span>
                                                </button>
                                                <button className="hover:text-white">
                                                    <Share2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center">No blogs found.</p>
                    )}
                    <Paginator
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={handlePageChange} 
                    />
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
