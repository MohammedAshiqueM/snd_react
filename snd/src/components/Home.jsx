import React from 'react';
import { useState } from 'react';
import { Bell, Heart, MessageCircle, Search, Share2,ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

const Home = () => {
    const [votes, setVotes] = useState({});

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

  const categories = [
    "Home",
    "For you",
    "Following",
    "Python",
    "DevOps",
    "JavaScript",
    "PostgreSQL",
    "MongoDB",
    "Fiji",
  ];

  const posts = [
    {
        id: 1,
        title: "Warp: Your terminal,",
        author: "User 1",
        image: "/placeholder.svg",
        score: 148,
        comments: 28,
        avatar: "/placeholder.svg",
      },
      {
        id: 2,
        title: "How to Get Started as a PHP Developer",
        author: "User 2",
        image: "/placeholder.svg",
        score: 89,
        comments: 15,
        avatar: "/placeholder.svg",
      },
      {
        id: 3,
        title: "Code Timeline Generator",
        author: "User 3",
        image: "/placeholder.svg",
        score: 234,
        comments: 42,
        avatar: "/placeholder.svg",
      },
      {
        id: 4,
        title: "Data structures and algorithms cheat sheet for interviews",
        author: "User 4",
        image: "/placeholder.svg",
        score: 167,
        comments: 31,
        avatar: "/placeholder.svg",
      },
      {
        id: 5,
        title: "How to Set Up Automated GitHub Workflows for Your Python and React...",
        author: "User 5",
        image: "/placeholder.svg",
        score: 112,
        comments: 19,
        avatar: "/placeholder.svg",
      },
      {
        id: 6,
        title: "A self-hostable personal dashboard built for you",
        author: "User 6",
        image: "/placeholder.svg",
        score: 156,
        comments: 23,
        avatar: "/placeholder.svg",
      },
  ];

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
                className="border border-gray w-full rounded-md bg-gray-800/50 px-4 py-2 pl-10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-blue-500"
              />
            </div>
          </div>
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
          {categories.map((category, i) => (
            <button
              key={i}
              className="px-4 py-2 text-gray-400 hover:text-white whitespace-nowrap"
            >
              {category}
            </button>
          ))}
              <button className="p-1 text-gray-500">
                <ChevronRight className="h-5 w-5" />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post, i) => (
              <div
                key={i}
                className="group rounded-lg border border-gray-800 bg-[#0D0E21] p-4 transition-colors hover:border-gray-700"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-white">{post.title}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-700" />
                      <span className="text-sm text-gray-400">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      {/* Voting System */}
                      <div className="flex items-center gap-0.5 bg-[#1A1B2E] rounded-md p-0.5">
                        <button 
                          onClick={() => handleVote(post.id, 1)}
                          className={`p-1 rounded ${votes[post.id] === 1 ? 'text-blue-500 bg-blue-500/10' : 'hover:bg-[#2A2B3E]'}`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <span className="text-xs px-1 min-w-[24px] text-center">
                          {post.score + (votes[post.id] || 0)}
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
                        <span className="text-xs">{post.comments}</span>
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
        </main>
      </div>
    </div>
  );
};

export default Home;