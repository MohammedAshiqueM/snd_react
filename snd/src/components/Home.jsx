import React from 'react';
import { useState,useEffect } from 'react';
import { Bell, Heart, MessageCircle, Search, Share2,ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Pen } from 'lucide-react';
import { getBlogs, logoutUser, userSkills } from '../api';
import { useNavigate } from 'react-router-dom';
import BlogWriteModal from './BlogWriteModal';
import { baseUrl } from '../constants/constant';
import useAuthStore from '../store/useAuthStore';
import SideBar from './SideBar';
import NavBar from './NavBar';
import { useSearchContext } from '../context/searchContext';
import useSearchStore from "../store/useSearchStore";

const Home = () => {
    const [votes, setVotes] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const url = baseUrl
    const navigate = useNavigate();
    const { setSearchContext } = useSearchContext();
    const { 
        searchQuery, 
        selectedCategory, 
        currentPage, 
        setSelectedCategory, 
        setCurrentPage 
    } = useSearchStore();
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [skills, setSkills] = useState(['All']);
    const blogsPerPage = 12;

  const handleVote = (postId, voteType) => {
    setVotes(prev => {
      const currentVote = prev[postId] || 0;
      
      // If clicking the same button, remove the vote
      if (currentVote === voteType) {
        const newVotes = { ...prev };
        delete newVotes[postId];
        return newVotes;
      }
      
      // Otherwise set the new vote
      return {
        ...prev,
        [postId]: voteType
      };
    });
  };



const handleSearch = (query) => {
    setCurrentPage(1);
    fetchBlogs(1, selectedCategory, query);
};



const fetchBlogs = async (page = currentPage, category = selectedCategory, query = searchQuery) => {
    try {
        const params = {
            page: page,
            limit: blogsPerPage,
            category: category,
            search: query
        };

        const response = await getBlogs(params);
        setPosts(response.data);
        setTotalPages(response.total_pages || 1);
    } catch (err) {
        console.error(err);
        setPosts([]);
        setTotalPages(1);
    }
};

const fetchUserSkills = async () => {
    try {
        const response = await userSkills();
        setSkills(['All', ...response.data.skills]);
    } catch (err) {
        console.error(err);
        alert('Failed to fetch skills.');
    }
};


const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchBlogs(newPage, selectedCategory, searchQuery);
};


useEffect(() => {
    fetchBlogs(1, selectedCategory, searchQuery);
    fetchUserSkills();
}, []);
useEffect(() => {
    console.log("Fetched posts:", posts);
}, [posts]);

useEffect(() => {
    if (searchQuery) {
        const matchingCategory = skills.find(skill =>
            skill.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (matchingCategory) {
            setSelectedCategory(matchingCategory);
            fetchBlogs(1, matchingCategory, searchQuery);
        } else {
            setSelectedCategory('All');
            fetchBlogs(1, 'All', searchQuery);
        }
    } else {
        // When search query is empty, reset to default
        setSelectedCategory('All');
        fetchBlogs(1);
    }
}, [searchQuery, skills]);
// Fetch skills and initial blogs
useEffect(() => {
    const fetchInitialData = async () => {
        try {
            // Fetch skills logic here
            const skillsResponse = await userSkills();
            setSkills(['All', ...skillsResponse.data.skills]);
        } catch (err) {
            console.error(err);
        }
    };

    fetchInitialData();
}, []);
 // Fetch blogs when search query, category, or page changes
 useEffect(() => {
    fetchBlogs();
}, [searchQuery, selectedCategory, currentPage]);
useEffect(() => {
        setSearchContext('blogs');
    }, []);
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
        <SideBar/>

        {/* Content Grid */}
        <main className="flex-1 p-4">
                    {(posts || []).length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {(posts || []).map((post, i) => (
                                <div
                                    key={i}
                                    className="group rounded-lg border border-gray-800 bg-[#0D0E21] p-4 transition-colors hover:border-gray-700"
                                    onClick={() => navigate(`/blogs/${post.slug}`)} 
                                >
                                    <div className="relative aspect-video overflow-hidden rounded-lg">
                                        {post.image?<img
                                            src={`${url}${post.image}` || '/default-image.jpg'}
                                            alt={post.title || 'Untitled'}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />:<></>}
                                    </div>
                                    <div className="mt-4">
                                    <h3 className="font-semibold text-white truncate whitespace-nowrap overflow-hidden">
                                        {post.title || 'Untitled Post'}
                                    </h3>
                                                
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
                                                <div className="h-6 w-6 rounded-full bg-gray-700" >{post.user?<img
                                                        src={`${url}${post.user.profile_image}` || '/default-image.jpg'}
                                                        alt={post.user.first_name || 'Untitled'}
                                                        className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-105"
                                                    />:<></>}</div>
                                                <span className="text-sm text-gray-400">
                                                    {post.user?.first_name || 'Unknown Author'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                {/* Voting System */}
                                                <div className="flex items-center gap-0.5 bg-[#1A1B2E] rounded-md p-0.5">
                                                    <button
                                                        onClick={() => handleVote(post.id, 1)}
                                                        className={`p-1 rounded ${
                                                            votes[post.id] === 1
                                                                ? 'text-blue-500 bg-blue-500/10'
                                                                : 'hover:bg-[#2A2B3E]'
                                                        }`}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-xs px-1 min-w-[24px] text-center">
                                                        {(post.vote_count || 0) + (votes[post.id] || 0)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(post.id, -1)}
                                                        className={`p-1 rounded ${
                                                            votes[post.id] === -1
                                                                ? 'text-red-500 bg-red-500/10'
                                                                : 'hover:bg-[#2A2B3E]'
                                                        }`}
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
                </main>

      </div>
    {/* Pagination */}
    <div className="flex justify-center mt-4">
                <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
                Previous
            </button>
            <span className="px-4 py-2 text-white">{currentPage} / {totalPages}</span>
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
                Next
            </button>

            </div>

      <BlogWriteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        // userData={profile}
      />
    </div>
  );
};

export default Home;