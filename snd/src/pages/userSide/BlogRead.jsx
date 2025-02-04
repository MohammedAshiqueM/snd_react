import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { blogRead, followUnfollow, getComments, postComment, voteBlog,  } from '../../api'; 
import { MessageCircle, Eye, ArrowBigUp, ArrowBigDown, Share2, Copy } from 'lucide-react';
import { baseUrl, getCloudinaryUrl } from '../../constants/constant';
import { formatDistanceToNow } from 'date-fns';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg'
import { useAuthStore } from '../../store/useAuthStore';

export default function BlogRead() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isOwner, setIsOwner] = useState(false);
  const { user } = useAuthStore();
  const commentsRef = useRef(null);  
  const toggleComments = () => {
    setShowComments(!showComments);
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const url = baseUrl;
  
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };
  
  const handleVote = async (voteType) => {
    try {
      const newVoteType = userVote === voteType ? null : voteType;
      const response = await voteBlog(slug, voteType);
  
      if (response.vote_count !== undefined) {
        setVotes(response.vote_count); // Update the vote count on the UI
        setUserVote(newVoteType);
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };
  const handleFollowUnfollow = async (pk) => {
    try {
      const response = await followUnfollow(pk);
      setIsFollowing(prevProfile => !prevProfile);
    //   console.log(response.data.message);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const addedComment = await postComment(slug, newComment);
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

//   const toggleComments = () => {
//     setShowComments(!showComments);
//   };

  useEffect(() => {
    async function loadBlog() {
      try {
        const blogData = await blogRead(slug);
        setBlog(blogData);
        setVotes(blogData.data.vote_count || 0);
        setUserVote(blogData.data.user_vote);
        setIsFollowing(blogData.data.is_following);
        if (blogData.data.user.username === user.username) {
            setIsOwner(true);
          } else {
            setIsOwner(false);

          }
      } catch (err) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    }

    async function loadComments() {
      try {
        const commentsData = await getComments(slug);
        setComments(commentsData.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadBlog();
    loadComments();
  }, [slug]);
  
  if (loading) return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
  
  if (error) return <div>{error}</div>;
  const blogWriterImage = getCloudinaryUrl(blog.data.user.profile_image) || noUser;
  const blogImage = getCloudinaryUrl(blog.data.image);
  
  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
      <SecondNavbar />

      <main className="flex-1 pt-16 transition-all duration-300">
        <SideBar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
        
        <article className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
          <div className="max-w-[1200px] mx-auto">
            {/* Author Section */}
            <div className="mb-6 flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                  <div className="h-full w-full rounded-full bg-[#0D0E21] p-0.5">
                    <img 
                      src={blogWriterImage} 
                      alt={blog.data.user.first_name}
                      className="w-full h-full rounded-full object-cover" 
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {`${blog.data.user.first_name} ${blog.data.user.last_name}`}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Posted {formatDistanceToNow(new Date(blog.data.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Eye className="h-5 w-5" />
                  <span>{blog.data.view_count} Views</span>
                </div>
                {!isOwner && (
                  <button
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                      isFollowing 
                        ? "bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500 hover:to-red-600 border border-red-500/20 hover:border-red-500" 
                        : "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/20 hover:border-indigo-500"
                    } text-gray-400 hover:text-white`}
                    onClick={() => handleFollowUnfollow(blog.data.user.id)}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <div className="border-t border-gray-800/50">
              <h1 className="text-3xl font-bold text-white pt-6 pb-4 px-4">
                {blog.data.title}
              </h1>
              
              {blog.data.image && (
                <div className="mb-8">
                  <img 
                    src={blogImage} 
                    alt={blog.data.title} 
                    className="w-full max-h-[400px] object-contain" 
                  />
                </div>
              )}
              
              <div className="prose prose-invert max-w-none px-4">
                <p className="mb-4 text-gray-300 leading-relaxed">{blog.data.body_content}</p>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="mt-8 flex items-center justify-between px-4 py-2 border-t border-b border-gray-800/50">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleVote('upvote')} 
                  className={`rounded-lg p-2 transition-all duration-300 ${
                    userVote === 'upvote' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                      : 'hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowBigUp className="h-6 w-6" />
                </button>
                <span className="text-lg font-semibold min-w-[40px] text-center">{votes}</span>
                <button 
                  onClick={() => handleVote('downvote')} 
                  className={`rounded-lg p-2 transition-all duration-300 ${
                    userVote === 'downvote' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                      : 'hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowBigDown className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleComments}
                  className="flex items-center space-x-2 rounded-lg px-4 py-2 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 text-gray-400 hover:text-white transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Comment</span>
                </button>
                
                <button className="flex items-center space-x-2 rounded-lg px-4 py-2 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 text-gray-400 hover:text-white transition-all duration-300">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center space-x-2 rounded-lg px-4 py-2 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 text-gray-400 hover:text-white transition-all duration-300">
                  <Copy className="h-5 w-5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div ref={commentsRef} className="mt-8 px-4">
              {showComments && (
                <div>
                  <h3 className="mb-6 text-xl font-semibold text-white">
                    Comments
                  </h3>
                  
                  <div className="mb-8">
                    <textarea
                      placeholder="Write your thoughts..."
                      className="w-full bg-[#1a1b2e] text-white placeholder:text-gray-500 focus:outline-none rounded-lg border border-gray-800/50 p-3 focus:border-indigo-500/50 transition-all duration-300"
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-2 text-sm font-medium text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
                        onClick={handleAddComment}
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div 
                        key={comment.id} 
                        className="border-b border-gray-800/50 pb-4 flex items-start space-x-4"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5">
                          <div className="h-full w-full rounded-full bg-[#0D0E21] p-0.5">
                            <img
                              src={comment.user.profile_image ? getCloudinaryUrl(comment.user.profile_image) : noUser}
                              alt={comment.user.first_name}
                              className="w-full h-full rounded-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-semibold text-white">
                              {`${comment.user.first_name} ${comment.user.last_name}`}
                            </p>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(comment.created_at))} ago
                            </span>
                          </div>
                          <p className="mt-1 text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}