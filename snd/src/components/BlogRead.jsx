import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { blogRead } from '../api'; 
import { MessageCircle, ThumbsUp, ThumbsDown, Share2, Copy, ChevronDown } from 'lucide-react'
import { baseUrl } from '../constants/constant';


export default function BlogRead() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [votes, setVotes] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplies, setShowReplies] = useState({})
  const url = baseUrl
  
  const navItems = ['Home', 'Discover', 'Account', 'Tags', 'Users', 'Messages', 'Requests']
  
  const handleVote = (increment) => {
    setVotes(votes + increment)
  }

  const handleLike = (commentId) => {
    setComments(comments.map(comment => 
      comment.id === commentId ? {...comment, likes: comment.likes + 1} : comment
    ))
  }

  const handleReply = (commentId, replyContent) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? {...comment, replies: [...comment.replies, { user: 'You', content: replyContent }]} 
        : comment
    ))
  }

  const toggleReplies = (commentId) => {
    setShowReplies({...showReplies, [commentId]: !showReplies[commentId]})
  }

  useEffect(() => {
    async function fetchBlog() {
      try {
        const blogData = await blogRead(slug);
        console.log("blog data is...",blogData)
        setBlog(blogData);
        console.log("the blog ",blog)
        setVotes(blogData.vote_count || 0); // Initialize votes
        setComments(blogData.comments || []); // Assuming comments are part of the response
      } catch (err) {
        setError('Failed to load the blog.');
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    console.log("Updated blog state:", blog);
  }, [blog]);
  
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
                <img src={`${url}${blog.data.user.profile_image}`} className="object-cover w-full h-full" />
              </div>
              <div>
                <h3 className="font-semibold">{blog.data.user?.email || 'Unknown Author'}</h3>
                <p className="text-sm text-gray-400">Posted {blog.data.created_at}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Posted 2 days ago</span>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm font-medium hover:bg-blue-700">
                Follow
              </button>
            </div>
          </div>

          {/* Blog Content */}
          <h1 className="mb-8 text-3xl font-bold">{blog.data.title}</h1>
          {blog.data.image?<img src={`${url}${blog.data.image}`} alt={blog.data.title} className="mb-8 w-full rounded-lg" />:<></>}
          <div className="prose prose-invert max-w-none">
            <p className="mb-4 text-gray-300">{blog.data.body_content}</p>
          </div>

          
          {/* Voting and actions */}
          <div className="mb-8 flex items-center justify-between">
            {/* Voting */}
          <div className="mb-8 flex items-center space-x-4">
            <button onClick={() => handleVote(1)} className="rounded-full bg-gray-800 p-2 hover:bg-gray-700">
              <ThumbsUp className="h-6 w-6" />
            </button>
            <span className="text-xl font-semibold">{votes}</span>
            <button onClick={() => handleVote(-1)} className="rounded-full bg-gray-800 p-2 hover:bg-gray-700">
              <ThumbsDown className="h-6 w-6" />
            </button>
          </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 rounded-full bg-gray-800 px-4 py-2 hover:bg-gray-700">
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

          {/* Comments Section
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="mb-6 text-lg font-semibold">Comments</h3>
            List of comments
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#1A1B2E] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-700" />
                    <span className="font-medium">{comment.user}</span>
                  </div>
                  <p className="mb-4 text-gray-300">{comment.content}</p>
                </div>
              ))}
            </div>
          </div> */}
        </article>
      </main>

      {/* Main Content */}
      <main className="ml-48 p-8">
        <article className="mx-auto max-w-4xl">        

          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="mb-6 text-lg font-semibold">Comments</h3>
            
            

            {/* Comment Form */}
            <div className="mb-8 rounded-lg bg-[#1A1B2E] p-4">
              <textarea
                placeholder="Write your thoughts..."
                className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none rounded-lg border border-gray-600 p-3"
                rows={4}
              />
              <div className="mt-4 flex justify-end">
                <button className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Post
                </button>
              </div>
            </div>


            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-[#1A1B2E] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-700" />
                    <span className="font-medium">{comment.user}</span>
                    <span className="text-sm text-gray-500">• 2h ago</span>
                  </div>
                  <p className="mb-4 text-gray-300">{comment.content}</p>
                  <div className="flex gap-4 text-gray-400">
                    <button onClick={() => handleLike(comment.id)} className="flex items-center gap-1 hover:text-white">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{comment.likes}</span>
                    </button>
                    <button onClick={() => toggleReplies(comment.id)} className="flex items-center gap-1 hover:text-white">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">Reply</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-white">
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                  {showReplies[comment.id] && (
                    <div className="mt-4 space-y-4">
                      {comment.replies.map((reply, index) => (
                        <div key={index} className="ml-8 rounded-lg bg-[#252638] p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-gray-700" />
                            <span className="font-medium">{reply.user}</span>
                          </div>
                          <p className="text-sm text-gray-300">{reply.content}</p>
                        </div>
                      ))}
                      <div className="ml-8 mt-2">
                        <textarea
                          placeholder="Write a reply..."
                          className="w-full rounded-lg bg-[#252638] p-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
                          rows={2}
                        />
                        <div className="mt-2 flex justify-end">
                          <button onClick={() => handleReply(comment.id, 'Sample reply')} className="rounded bg-blue-600 px-3 py-1 text-xs font-medium hover:bg-blue-700">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </article>
      </main>
    </div>
  )
}