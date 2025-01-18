import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Tag, Clock, UserCheck, Calendar, MessageSquare  } from 'lucide-react';
import SideBar from '../../components/SideBar';
import NavBar from '../../components/NavBar';
import Paginator from "../../components/Paginator";
import RequestShimmer from '../../components/RequestShimmer';
import { truncateText } from '../../util';
import { useAuthStore } from '../../store/useAuthStore';
import { receivedProposes, sendProposes } from '../../wsApi';
import useSearchStore from '../../store/useSearchStore';
import useSkillsStore from '../../store/useSkillStore';

const TabButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-200 ${
        active 
          ? 'bg-[#1A1B2E] text-blue-400 border-t-2 border-blue-400' 
          : 'bg-transparent text-gray-400 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
  
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'PR': 'bg-yellow-900/50 text-yellow-400',
      'AC': 'bg-green-900/50 text-green-400',
      'RE': 'bg-red-900/50 text-red-400',
      'CO': 'bg-blue-900/50 text-blue-400',
      'CA': 'bg-gray-900/50 text-gray-400',
    };
  
    const statusText = {
      'PR': 'Proposed',
      'AC': 'Accepted',
      'RE': 'Rejected',
      'CO': 'Completed',
      'CA': 'Cancelled',
    };
  
    return (
      <span className={`px-3 py-1 rounded-full ${statusColors[status]}`}>
        {statusText[status]}
      </span>
    );
  };
  
  const ProposalCard = ({ proposal }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
  
    const handleClick = () => {
      navigate(`/requests/${proposal.request.id}`);
    };
  
    return (
      <div
        className="border border-gray-700 bg-[#1A1B2E] rounded-lg p-6 relative hover:border-blue-400 transition-colors duration-200 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-blue-400 hover:text-blue-300">
            {proposal.request.title}
          </h2>
          <StatusBadge status={proposal.status} />
        </div>
  
        {proposal.note && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg">
            <MessageSquare size={16} className="text-gray-400 mt-1" />
            <p className="text-gray-300">{proposal.note}</p>
          </div>
        )}
  
        <div className="flex flex-wrap gap-2 mb-4">
          {proposal.request.tags?.map((tag, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-900/50 text-blue-400"
            >
              <Tag size={14} />
              {tag.name}
            </span>
          ))}
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span>
              Scheduled: {new Date(proposal.scheduled_time).toLocaleString()} ({proposal.timezone})
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <UserCheck size={16} />
            <span>
              {user.id === proposal.teacher.id 
                ? `Student: ${proposal.student.username}` 
                : `Teacher: ${proposal.teacher.username}`}
            </span>
          </div>
        </div>
  
        <div className="text-sm text-gray-400">
          Created {formatDistanceToNow(new Date(proposal.request.created_at))} ago
        </div>
      </div>
    );
  };
  
  function ProposedRequests() {
    const [activeTab, setActiveTab] = useState('sent');
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
      return JSON.parse(localStorage.getItem('isSidebarCollapsed') || 'false');
    });
  
    const { user } = useAuthStore();
    const { skills } = useSkillsStore();
    const { 
        searchQuery, 
        selectedCategory, 
        currentPage, 
        setSelectedCategory, 
        setCurrentPage, 
        setSearchContext 
      } = useSearchStore();
    
      const requestsPerPage = 5;

    const fetchProposals = async (page, category, query) => {
      setIsLoading(true);
      try {
        const params = {
            page: page,
            page_size: requestsPerPage,
            category: category !== 'All' ? category : '',
            search: query
          };

      const response = await (activeTab === 'sent' 
        ? sendProposes(params)
        : receivedProposes(params)
      );

      if (response) {
        setProposals(response.results || []);
        setTotalPages(Math.ceil((response.count || 0) / requestsPerPage));
      }
      } catch (err) {
        console.error(err);
        setProposals([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      fetchProposals(newPage);
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
        setSearchContext('schedules');
      }
    }, []);
  
    useEffect(() => {
        if (searchQuery) {
          const matchingCategory = skills.find(
            skill => skill.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const categoryToFetch = matchingCategory || "All";
          if (selectedCategory !== categoryToFetch) {
            setSelectedCategory(categoryToFetch);
          }
          fetchProposals(1, categoryToFetch, searchQuery);
        } else {
          fetchProposals(1, selectedCategory, "");
        }
      }, [searchQuery, selectedCategory, skills, activeTab]);

    useEffect(() => {
      fetchProposals(currentPage);
    }, [activeTab, currentPage, user.id]);
  
    return (
      <div className="min-h-screen bg-[#0A0B1A] text-gray-300 flex flex-col">
        <NavBar />
        <div className="flex flex-1">
          <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
          <main className="flex-1">
            <div className={`p-4 pt-40 transition-all duration-300 ${
              isSidebarCollapsed ? 'ml-16' : 'ml-48'
            }`}>
              <div className="flex gap-2 mb-6 border-b border-gray-700">
                <TabButton 
                  active={activeTab === 'sent'} 
                  onClick={() => {
                    setActiveTab('sent');
                    setCurrentPage(1);
                  }}
                >
                  Sent Proposals
                </TabButton>
                <TabButton 
                  active={activeTab === 'received'} 
                  onClick={() => {
                    setActiveTab('received');
                    setCurrentPage(1);
                  }}
                >
                  Received Proposals
                </TabButton>
              </div>
  
              <div className="space-y-6">
                {isLoading ? (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <RequestShimmer key={index} />
                    ))}
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No {activeTab === 'sent' ? 'sent' : 'received'} proposals found.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {proposals.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <Paginator 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  export default ProposedRequests;