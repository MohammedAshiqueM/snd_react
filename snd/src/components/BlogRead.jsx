import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogRead, getComments, postComment,  } from '../api'; 
import { MessageCircle, Eye, ThumbsUp, ThumbsDown, Share2, Copy } from 'lucide-react'
import { baseUrl } from '../constants/constant';
import { formatDistanceToNow } from 'date-fns';

export default function BlogRead() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const url = baseUrl;
  
  const navItems = ['Home', 'Discover', 'Account', 'Tags', 'Users', 'Messages', 'Requests'];
  
  const handleVote = async (voteType) => {
    try {
      const response = await voteBlog(slug, voteType);
      setVotes(response.vote_count);
    } catch (err) {
      console.error('Failed to vote:', err);
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

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  useEffect(() => {
    async function loadBlog() {
      try {
        const blogData = await blogRead(slug);
        setBlog(blogData);
        setVotes(blogData.data.vote_count || 0);
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
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-48 border-r border-gray-800 bg-[#0D0E21] p-4">
        <div className="mb-8 text-xl font-bold">
          <span className="font-mono">&lt;/&gt;</span>Snd
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item}
              className="w-full rounded-lg px-3 py-2 text-left text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-48 p-8">
        <article className="mx-auto max-w-4xl">
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
          {blog.data.image && (
            <img 
              src={`${url}${blog.data.image}`} 
              alt={blog.data.title} 
              className="mb-8 w-full rounded-lg" 
            />
          )}
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-gray-300">{blog.data.body_content}</p>
          </div>
          
          {/* Voting and actions */}
          <div className="mb-8 flex items-center justify-between">
            {/* Voting */}
            <div className="mb-8 flex items-center space-x-4">
              <button 
                onClick={() => handleVote('upvote')} 
                className="rounded-full bg-gray-800 p-2 hover:bg-gray-700"
              >
                <ThumbsUp className="h-6 w-6" />
              </button>
              <span className="text-xl font-semibold">{votes}</span>
              <button 
                onClick={() => handleVote('downvote')} 
                className="rounded-full bg-gray-800 p-2 hover:bg-gray-700"
              >
                <ThumbsDown className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleComments}
                className="flex items-center space-x-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Comment</span>
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

          {/* Comments Section */}
          {showComments && (
            <div className="mt-12 border-t border-gray-800 pt-8">
              <h3 className="mb-6 text-lg font-semibold">Comments</h3>
              
              {/* Comment Form */}
              <div className="mb-8 rounded-lg bg-[#1A1B2E] p-4">
                <textarea
                  placeholder="Write your thoughts..."
                  className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none rounded-lg border border-gray-600 p-3"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <button 
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    onClick={handleAddComment}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="mt-4 space-y-4">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className="border-b border-gray-700 pb-4 flex items-start space-x-4"
                  >
                    <div className="h-8 w-8 rounded-full bg-gray-700 overflow-hidden">
                      <img 
                        src={`${url}${comment.user.profile_image}`} 
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