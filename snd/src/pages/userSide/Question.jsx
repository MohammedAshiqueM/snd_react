import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Search, Home, Compass, User, Tag, Users, MessageSquare, FileQuestion, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pen } from 'lucide-react';
import SideBar from '../../components/SideBar';
import NavBar from '../../components/NavBar';
import QuestionWriteModal from '../../components/QuestionWriteModal';
import useSearchStore from '../../store/useSearchStore';
import { getQuestion, userSkills } from '../../api';
import { baseUrl, getCloudinaryUrl } from '../../constants/constant';
import { truncateText } from '../../util';
import Paginator from "../../components/Paginator";
import useSkillsStore from '../../store/useSkillStore';
import Shimmer from './Shimmer';
import QuestionShimmer from '../../components/QuestionShimmer';
import noUser from '../../assets/Images/no_user.jpg';


function Question() {
  const [questions, setQuestions] = useState([]);
  const [votes, setVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { skills } = useSkillsStore();  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
      const savedState = localStorage.getItem('isSidebarCollapsed');
      return savedState ? JSON.parse(savedState) : false;
    });
  
  const navigate = useNavigate();
  const { 
    searchQuery, 
    selectedCategory, 
    currentPage, 
    setSelectedCategory, 
    setCurrentPage, 
    setSearchContext 
  } = useSearchStore();

  const questionsPerPage = 12;

  const fetchQuestions = async (page, category, query) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        limit: questionsPerPage,
        category,
        search: query
      };
      const response = await getQuestion(params);
      setQuestions(response.data);
      setTotalPages(response.total_pages || 1);
    } catch (err) {
      console.error(err);
      setQuestions([]);
      setTotalPages(1);
    }finally {
        setIsLoading(false);
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
        setSearchContext('questions');
    }
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
        fetchQuestions(1, categoryToFetch, searchQuery);
    } else {
        fetchQuestions(1, selectedCategory, "");
    }
}, [searchQuery, selectedCategory, skills]);

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-gray-300 flex flex-col">
      <NavBar 
        // onSearch={handleSearch}
        searchQuery={searchQuery}
        onWriteClick={() => setIsEditModalOpen(true)} 
        writeButtonLabel="Ask question"
      />
      <div className="flex flex-1">
        <SideBar
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
        />
        <main className="flex-1 p-4">
        <div className={`flex-1 p-4 pt-40 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-48'}`}>
          {isLoading ? (
            <div className="flex flex-col gap-4">
            {Array.from({ length: questionsPerPage }).map((_, index) => (
              <QuestionShimmer key={index} />
            ))}
          </div>
          ) : (     
            <div className="flex flex-col gap-4"> 
            {questions.map((question) => (
              <div key={question.id} 
                className="border border-gray-700 bg-[#1A1B2E] rounded-lg p-4 relative hover:border-gray-500" 
                onClick={() => navigate(`/question/${question.id}`)}>
                <div className="absolute top-4 right-4 text-sm text-gray-400">
                  asked {formatDistanceToNow(new Date(question.created_at))} ago
                </div>
                <div className="flex items-start space-x-4">
                  <div className="text-center">
                    <div className="font-bold">{question.votes}</div>
                    <div className="text-sm text-gray-500">vote {question.vote_count}</div>
                    <div className="mt-2">
                      {question.answered?<span className="text-green-500">✓</span>:<span></span>}
                    </div>
                    {question.answers_count?<div className="text-sm text-gray-500">{question.answers_count} answer</div>:<div className="text-sm text-gray-500">No answers</div>}
                    <div className="mt-2">{question.views}</div>
                    <div className="text-sm text-gray-500">{question.view_count} views</div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-blue-400 hover:text-blue-300 cursor-pointer mb-2">
                      {question.title}
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                      {truncateText(question.body_content, 25)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {question.tags.map((tagObj, index) => (
                          <span key={index} 
                            className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded">
                            {tagObj.tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  {question.user && (
                    <div className="h-6 w-6 rounded-full bg-gray-700">
                      <img
                        src={question.user?.profile_image ? getCloudinaryUrl(question.user.profile_image) : noUser}
                        alt={question.user.first_name || 'Untitled'}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  )}
                  <span className="text-sm text-gray-400">
                    {question.user.first_name} {question.user.last_name}
                  </span>
                </div>
              </div>
            ))}
            </div>
            )}

        </div>
          <Paginator
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </main>
      </div>
      <QuestionWriteModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}

export default Question;
