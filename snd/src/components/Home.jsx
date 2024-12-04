import React from 'react';
import { useState,useEffect } from 'react';
import { Bell, Heart, MessageCircle, Search, Share2,ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Pen } from 'lucide-react';
import { getBlogs, logoutUser, userSkills } from '../api';
import { useNavigate } from 'react-router-dom';
import BlogWriteModal from './BlogWriteModal';
import { baseUrl } from '../constants/constant';


const Home = () => {
    const [votes, setVotes] = useState({});
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [skills, setSkills] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const url = baseUrl
    const blogsPerPage = 12;
    const navigate = useNavigate();


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

  
  const handleLogout = async () => {
    try {
        await logoutUser();
        alert("Logged out successfully!");
        navigate('/');

    } catch (err) {
        console.error(err);
        alert("Failed to log out.");
    }

  
};

const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    
};


  const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'All' || post.tags?.some(tag => tag.name === selectedCategory))
);


const fetchBlogs = async (page = 1, category = 'All', search = '') => {
    try {
        const params = {
            page,
            limit: blogsPerPage,
            category,
            search,
        };

        console.log("Fetching Blogs with Params:", params);
        const response = await getBlogs(params);
        console.log("Fetched Blogs Response:", response);

        setPosts(response.data);
        setTotalPages(response.total_pages || 1);
    } catch (err) {
        console.error(err);
        setPosts([]);
        setTotalPages(1);
        alert('Failed to fetch blogs.');
    }
};



const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchBlogs(1, category, searchQuery);
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
const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
        setCurrentPage(1);
        fetchBlogs(1, selectedCategory, searchQuery);
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
        } else {
            setSelectedCategory('All');
        }
    }
}, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#0A0B1A]">
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-[#0D0E21]">
        <div className="flex h-16 items-center justify-between px-4">
          <a href="/" className="text-xl font-bold text-white">
            <span className="font-mono">&lt;/&gt;</span>Snd
          </a>
          <div className="flex flex-1 items-center px-8">
            <div className="justify-center mx-auto relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                className="border border-gray w-full rounded-md bg-gray-800/50 px-4 py-2 pl-10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500"
            />

            </div>
          </div>
          <button className='text-gray-400' onClick={handleLogout}>Logout</button>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            <a href='/profile'><div className="h-8 w-8 rounded-full bg-gray-700" /></a>
          </div>
        </div>
      </nav>

      {/* Category Navigation */}
          
      <div className="border-b border-gray-800 bg-[#0D0E21] overflow-x-auto">
            <div className="flex justify-center px-4 mx-auto">
                <button className="p-1 text-gray-500">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                {skills.map((skill, i) => (
                    <button
                        key={i}
                        onClick={() => handleCategoryChange(skill)}
                        className={`px-4 py-2 whitespace-nowrap ${selectedCategory === skill ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'}`}
                    >
                        {skill}
                    </button>
                ))}
                <button className="p-1 text-gray-500">
                    <ChevronRight className="h-5 w-5" />
                </button>
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center hover:text-[#4D7EF2] text-white absolute right-10">
                  <Pen className="mr-1" /> Write
                </button>
            </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-48 border-r border-gray-800 bg-[#0D0E21] p-4 md:block">
          <nav className="space-y-2">
            {["Home", "Discover", "Account", "Tags", "Users", "Messages", "Requests"].map(
              (item, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-800 hover:text-white rounded-md"
                >
                  {item}
                </button>
              )
            )}
          </nav>
        </aside>

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

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-700" />
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