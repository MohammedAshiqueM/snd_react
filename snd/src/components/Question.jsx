import React from 'react';
import { useState,useEffect } from 'react';
import { Search, Home, Compass, User, Tag, Users, MessageSquare, FileQuestion, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pen } from 'lucide-react'
import { getQuestion , userSkills } from '../api';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../constants/constant';
import SideBar from './SideBar';
import NavBar from './NavBar';
import useSearchStore from "../store/useSearchStore";
import { formatDistanceToNow } from 'date-fns';
import QuestionWriteModal from './QuestionWriteModal'

function Question() {
  const [questions, setQuestions] = useState([]);
  const [votes, setVotes] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [skills, setSkills] = useState(['All']);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();
  const url = baseUrl
//   const { setSearchContext } = useSearchContext();
   const questionsPerPage = 12; 
  const { 
    searchQuery, 
    selectedCategory, 
    currentPage, 
    setSelectedCategory, 
    setCurrentPage ,
    setSearchContext
} = useSearchStore();
const fetchQuestions = async (page = currentPage, category = selectedCategory, query = searchQuery) => {
    try {
        const params = {
            page: page,
            limit: questionsPerPage,
            category: category,
            search: query
        };

        const response = await getQuestion(params);
        setQuestions(response.data);
        setTotalPages(response.total_pages || 1);
    } catch (err) {
        console.error(err);
        setQuestions([]);
        setTotalPages(1);
    }
};

  const fetchUserSkills = async () => {
    try {
      const response = await userSkills();
      setSkills(['All', ...response.data.skills]);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  const handleVote = (questionId, voteType) => {
    setVotes((prev) => {
      const currentVote = prev[questionId] || 0;
      if (currentVote === voteType) {
        const newVotes = { ...prev };
        delete newVotes[questionId];
        return newVotes;
      }
      return { ...prev, [questionId]: voteType };
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchQuestions(newPage, selectedCategory, searchQuery);
  };

  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === 'All' ||
      question.tags.some((tagObj) => 
        tagObj.tag && tagObj.tag.name.toLowerCase() === selectedCategory.toLowerCase()
      ))
  );

  const handleSearch = (query) => {
    setCurrentPage(1);
    fetchQuestions(1, selectedCategory, query);
  };

  useEffect(() => {
    setSearchContext('questions');

    fetchQuestions(1);
    fetchUserSkills();
  }, []);
  useEffect(() => {
    setSearchContext('questions');
}, []);

useEffect(() => {
    if (searchQuery) {
      const matchingCategory = skills.find(skill =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingCategory) {
        setSelectedCategory(matchingCategory);
        fetchQuestions(1, matchingCategory, searchQuery);
      } else {
        setSelectedCategory('All');
        fetchQuestions(1, 'All', searchQuery);
      }
    } else {
      // When search query is empty, reset to default
      setSelectedCategory('All');
      fetchQuestions(1);
    }
  }, [searchQuery, skills]);

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, selectedCategory, currentPage]);


  return (
    <div className="min-h-screen bg-[#0A0B1A] text-gray-300 flex flex-col">
      {/* Header */}
      <NavBar 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onWriteClick={() => setIsEditModalOpen(true)} 
        writeButtonLabel="Ask question"
      />
      <div className="flex flex-1">
        <SideBar/>
        {/* Sidebar */}

        {/* Main Content */}
        <main className="flex-1 p-4">
         

{/* Questions List */}
<div className="space-y-4 max-w-6xl mx-auto p-4 grid grid-cols-1 gap-4">
            {filteredQuestions.map((question) => (
              <div key={question.id} className="border border-gray-700 bg-[#1A1B2E] rounded-lg p-4 relative hover:border-gray-500">
              <div className="absolute top-4 right-4 text-sm text-gray-400">
                {/* Date at the Top Right */}
                asked {formatDistanceToNow(new Date(question.created_at))} ago
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-center">
                  <div className="font-bold">{question.votes}</div>
                  <div className="text-sm text-gray-500">votes</div>
                  <div className="mt-2">
                    <span className="text-green-500">✓</span> {question.answers}
                  </div>
                  <div className="text-sm text-gray-500">answer</div>
                  <div className="mt-2">{question.views}</div>
                  <div className="text-sm text-gray-500">views</div>
                </div>
                <div className="flex-1">
                  <h2 className="text-blue-400 hover:text-blue-300 cursor-pointer mb-2">
                    {question.title}
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">{question.body_content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {question.tags.map((tagObj, index) => (
                        <span
                          key={index}
                          className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded"
                        >
                          {tagObj.tag.name}
                        </span>
                      ))}
                    </div>
                    {/* <div className="text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          {question.user?.first_name || 'Unknown Author'}
                        </span>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {/* User Profile Image at the Bottom Right */}
                {question.user && (
                  <div className="h-6 w-6 rounded-full bg-gray-700">
                    <img
                      src={`${url}${question.user.profile_image}` || '/default-image.jpg'}
                      alt={question.user.first_name || 'Untitled'}
                      className="h-full w-full rounded-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <span className="text-sm text-gray-400">{question.user.first_name} {question.user.last_name}</span>
              </div>
            </div>
            
            ))}
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
        </main>
      </div>
      <QuestionWriteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        // userData={profile}
      />

    </div>
  )
}

export default Question

