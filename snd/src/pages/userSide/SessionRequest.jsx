import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Tag, Clock, UserCheck, Calendar, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';

import SideBar from '../../components/SideBar';
import NavBar from '../../components/NavBar';
import useSearchStore from '../../store/useSearchStore';
import { getRequests, getUserRequests, updateRequest } from '../../api';
import Paginator from "../../components/Paginator";
import useSkillsStore from '../../store/useSkillStore';
import RequestShimmer from '../../components/RequestShimmer';
import SessionRequestModal from '../../components/SessionRequestModal';
import { truncateText } from '../../util';
import StatusDropdown from '../../components/StatusDropdown';
import { useAuthStore } from '../../store/useAuthStore';
import ScheduleProposal from '../../components/ScheduleProposal';
import { ProposalCount } from './ProposedSchedules';


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
  
  const RequestCard = ({ request, onStatusUpdate, onEdit }) => {
    const [updateLoading, setUpdateLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const isOwner = request?.user?.username === user.username;
    const canSchedule = !isOwner && request.status === "PE" && !request?.has_proposed;
    const handleClick = (e) => {
      if (e.target.closest(".status-badge") || e.target.closest("button")) {
        e.stopPropagation();
        return;
      }
      navigate(`/requests/${request.id}`);
    };
  
    const handleStatusChange = async (newStatus) => {
      setUpdateLoading(true);
      setError(null);
  
      try {
        await updateRequest(request.id, { status: newStatus });
        onStatusUpdate(request.id, newStatus);
        setShowStatusDropdown(false);
      } catch (error) {
        console.error("Error updating status:", error);
        setError("Failed to update status. Please try again.");
      } finally {
        setUpdateLoading(false);
      }
    };
  
    return (
      <div
        className="border border-gray-700 bg-[#1A1B2E] rounded-lg p-6 relative hover:border-blue-400 transition-colors duration-200 cursor-pointer"
        onClick={handleClick}
      >
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-blue-400 hover:text-blue-300">
            {request.title}
          </h2>
          <div className="status-badge" onClick={(e) => e.stopPropagation()}>
            <StatusDropdown
              currentStatus={request.status}
              onStatusChange={handleStatusChange}
              isOwner={isOwner}
            />
          </div>
        </div>
  
        {/* Content Section */}
        <p className="text-gray-300 mb-6 whitespace-pre-wrap">
          {truncateText(request.body_content, 24)}
        </p>
  
        {/* Tags Section */}
        <div className="flex flex-wrap gap-2 mb-4">
          {request.tags.map((tagObj, index) => (
            <span
              key={index}
              className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-900/50 text-blue-400"
            >
              <Tag size={14} />
              {tagObj.tag.name}
            </span>
          ))}
        </div>
  
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} />
            <span>{request.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={16} />
            <span>
              Preferred: {new Date(request.preferred_time).toLocaleString()}
            </span>
          </div>
        </div>
  
        {/* User Info */}
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <UserCheck size={16} />
          <span>
            Requested by {request.user?.username}{" "}
            {formatDistanceToNow(new Date(request.created_at))} ago
          </span>
        </div>
        {isOwner && (
        <ProposalCount count={request.schedule_proposals_count} />
      )}
        {/* Schedule List */}
        <div
          className="flex justify-end gap-4 mt-4"
          onClick={(e) => e.stopPropagation()} // Prevent parent click
        >
          {canSchedule && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScheduleModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Propose Schedule
              </button>
              {isScheduleModalOpen && (
                <ScheduleProposal
                  isOpen={isScheduleModalOpen}
                  onClose={() => setIsScheduleModalOpen(false)}
                  requestId={request.id}
                  onScheduleProposed={() => {
                    setIsScheduleModalOpen(false);
                  }}
                />
              )}
            </>
          )}
        
          {
            request.has_proposed && <div className={`px-3 py-1 rounded-md text-sm bg-green-900/50 text-green-400`}>
                    Scheduled
            </div>
          }
        </div>
      </div>
    );
  };
  
  

function SessionRequest() {
  const [activeTab, setActiveTab] = useState('my-requests');
  const [requests, setRequests] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [userRequestsTotalPages, setUserRequestsTotalPages] = useState(1);
  const [userRequestsCurrentPage, setUserRequestsCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });

  const navigate = useNavigate();
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

  const fetchRequests = async (page, category, query) => {
    setIsLoading(true);
    try {
      const params = { 
        page, 
        page_size: requestsPerPage, 
        category, 
        search: query 
      };
      const response = await getRequests(params);
      setRequests(response.results);
      setTotalPages(Math.ceil(response.count / requestsPerPage));
    } catch (err) {
      console.error(err);
      setRequests([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRequests = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: requestsPerPage,
        search: searchQuery,
        category: selectedCategory !== 'All' ? selectedCategory : ''
      };
      const response = await getUserRequests(params);
      setUserRequests(response.results);
      setUserRequestsTotalPages(Math.ceil(response.count / requestsPerPage));
    } catch (err) {
      console.error(err);
      setUserRequests([]);
      setUserRequestsTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStatusUpdate = (requestId, newStatus) => {
    const updateRequestsList = (list) => {
      return list.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      );
    };

    if (activeTab === 'my-requests') {
      setUserRequests(updateRequestsList(userRequests));
    } else {
      setRequests(updateRequestsList(requests));
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    setIsEditModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (activeTab === 'explore') {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
      fetchRequests(newPage, selectedCategory, searchQuery);
    } else {
      if (newPage < 1 || newPage > userRequestsTotalPages) return;
      setUserRequestsCurrentPage(newPage);
      fetchUserRequests(newPage);
    }
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
      setSearchContext('requests');
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
      fetchRequests(1, categoryToFetch, searchQuery);
    } else {
      fetchRequests(1, selectedCategory, "");
    }
  }, [searchQuery, selectedCategory, skills]);

  useEffect(() => {
    if (activeTab === 'my-requests') {
      fetchUserRequests(userRequestsCurrentPage);
    } else {
      fetchRequests(currentPage, selectedCategory, searchQuery);
    }
  }, [activeTab, currentPage, userRequestsCurrentPage, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0A0B1A] text-gray-300 flex flex-col">
      <NavBar 
        searchQuery={searchQuery}
        onWriteClick={() => {
          setEditingRequest(null);
          setIsEditModalOpen(true);
        }}
        writeButtonLabel="Request"
      />
      <div className="flex flex-1">
        <SideBar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        <main className="flex-1">
          <div className={`p-4 pt-40 transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-16' : 'ml-48'
          }`}>
            <div className="flex gap-2 mb-6 border-b border-gray-700">
              <TabButton 
                active={activeTab === 'my-requests'} 
                onClick={() => {
                  setActiveTab('my-requests');
                  setUserRequestsCurrentPage(1);
                }}
              >
                My Requests
              </TabButton>
              <TabButton 
                active={activeTab === 'explore'} 
                onClick={() => {
                  setActiveTab('explore');
                  setCurrentPage(1);
                }}
              >
                Explore Requests
              </TabButton>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: requestsPerPage }).map((_, index) => (
                    <RequestShimmer key={index} />
                  ))}
                </div>
              ) : activeTab === 'my-requests' ? (
                userRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">You have no active requests.</p>
                    <button 
                      onClick={() => setActiveTab('explore')}
                      className="mt-4 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Explore other requests →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {userRequests.map((request) => (
                        <RequestCard 
                          key={request.id} 
                          request={request}
                          onStatusUpdate={handleStatusUpdate}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                    <Paginator 
                      currentPage={userRequestsCurrentPage}
                      totalPages={userRequestsTotalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )
              ) : (
                <>
                  <div className="space-y-6">
                    {requests.map((request) => (
                      <RequestCard 
                        key={request.id} 
                        request={request}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                  <Paginator 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <SessionRequestModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRequest(null);
        }}
        initialData={editingRequest}
        mode={editingRequest ? 'edit' : 'create'}
      />
      
    </div>
  );
}

export default SessionRequest;