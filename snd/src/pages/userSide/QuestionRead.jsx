import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogRead, getAnswers, getComments, postAnswer, postComment, questionRead, voteQuestion,  } from '../../api'; 
import { MessageCircle, Eye, ThumbsUp, ThumbsDown, Share2, Copy } from 'lucide-react'
import { baseUrl } from '../../constants/constant';
import { formatDistanceToNow } from 'date-fns';
import SideBar from '../../components/SideBar';
import SecondNavbar from '../../components/SecondNavbar';
import noUser from '../../assets/Images/no_user.jpg'

export default function QuestionRead() {
  const { pk } = useParams();
  const [blog, setBlog] = useState(null);
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [showComments, setShowComments] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [userVote, setUserVote] = useState(null);
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
      const response = await voteQuestion(pk, voteType);
  
      if (response.vote_count !== undefined) {
        setVotes(response.vote_count); // Update the vote count on the UI
        setUserVote(newVoteType);
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const validateAnswer = () => {
    if (!newComment.trim()) return;

     if (newComment.length < 50) {
         setValidationError('Answer must be at least 50 characters long.');
             return false; 
            } 
             setValidationError('');
            return true;
        };
        
  const handleAddAnswer = async () => {
    if (!validateAnswer()) return;
    try {
      const addedComment = await postAnswer(pk, newComment);
      setComments([addedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  useEffect(() => {
    async function loadBlog() {
      try {
        const questionData = await questionRead(pk);
        setBlog(questionData);
        setVotes(questionData.data.vote_count || 0);
      } catch (err) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    }

    async function loadAnswers() {
      try {
        const commentsData = await getAnswers(pk);
        setComments(commentsData.data);
      } catch (err) {
        console.error(err);
      }
    }

    loadBlog();
    loadAnswers();
  }, [pk]);
  
  if (loading) return <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col"><SecondNavbar /></div>;
//   if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white flex flex-col">
        <SecondNavbar/>

      {/* Main Content */}
      <main className={`flex-1 pt-12 transition-all duration-300`}>
      {/* Sidebar */}
        <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />
        <article className={`mx-auto flex-1 p-6 pt-12 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}> {/* max-w-4xl */}
          {/* Author details */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-700 overflow-hidden">
                <img 
                  src={`${url}${blog.data.user.profile_image}`} 
                  alt={blog.data.user.first_name}
                  className="object-cover w-full h-full" 
                />
              </div>
              <div>
                <h3 className="font-semibold">
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
              <button className="rounded bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-700">
                Follow
              </button>
            </div>
          </div>

          {/* Blog Content */}
          <h1 className="mb-8 text-3xl font-bold">{blog.data.title}</h1>
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-gray-300">{blog.data.body_content}</p>
          </div>
          
          {/* Voting and actions */}
          <div className="mb-8 flex items-center justify-between">
            {/* Voting */}
            <div className="mb-8 flex items-center space-x-4">
            <button 
                onClick={() => handleVote('upvote')} 
                className={`rounded-full p-2 ${
                userVote === 'upvote' ? 'bg-[#85a8ff] hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
                <ThumbsUp className={`h-6 w-6 ${userVote === 'upvote' ? 'text-[#0c0eff] fill-[#85a8ff]' : 'text-gray-400'}`} />
            </button>
            <span className="text-xl font-semibold">{votes}</span>
            <button 
                onClick={() => handleVote('downvote')} 
                className={`rounded-full p-2 ${
                userVote === 'downvote' ? 'bg-[#ff9494] hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'
                }`}
            >
                <ThumbsDown className={`h-6 w-6 ${userVote === 'downvote' ? 'text-[#500000] fill-[#ff9494]' : 'text-gray-400'}`}  />
            </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleComments}
                className="flex items-center space-x-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Answers</span>
              </button>
              <button className="flex items-center space-x-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700">
                <Copy className="h-5 w-5" />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Answer Section */}
          {showComments && (
            <div className="mt-12 border-t border-gray-800 pt-8">
              <h3 className="mb-6 text-lg font-semibold">Answers</h3>
              
              {/* Answer Form */}
              <div className="mb-8 rounded-lg bg-[#1A1B2E] p-4">
                <textarea
                  placeholder="Write your thoughts..."
                  className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none rounded-lg border border-gray-600 p-3"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                {validationError && ( <p className="text-red-500 text-sm mt-2">{validationError}</p> )}
                <div className="mt-4 flex justify-end">
                  <button 
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={handleAddAnswer}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Answer List */}
              <div className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="border-b border-gray-700 pb-4 flex items-start space-x-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-700 overflow-hidden">
                      <img 
                        src={comment.user.profile_image ? `${baseUrl}${comment.user.profile_image}` : noUser}
                        alt={comment.user.first_name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold">
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
        </article>
      </main>
    </div>
  )
}