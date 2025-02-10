import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Tag, Clock, UserCheck, Calendar, ChevronUp, ChevronDown, MoreVertical, AlertTriangle, X } from 'lucide-react';

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

const ErrorToast = ({ message, onDismiss }) => {
    if (!message) return null;
  
    return (
      <div className="fixed bottom-4 right-4 flex items-center bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right-2 z-50">
        <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="ml-4 text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  };

const TabButton = ({ active, onClick, children }) => (
    <button
    onClick={onClick}
    className={`px-6 py-3 text-lg font-medium rounded-t-lg transition-all duration-300 relative
      ${active 
        ? 'text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-t-2 border-indigo-500' 
        : 'text-gray-400 hover:text-white hover:bg-indigo-500/10'}`}
  >
    {children}
    {active && (
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
    )}
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

    useEffect(() => {
        let errorTimeout;
        if (error) {
          errorTimeout = setTimeout(() => {
            setError(null);
          }, 5000); // Auto-dismiss after 5 seconds
        }
        return () => clearTimeout(errorTimeout);
      }, [error]);
    
      const formatErrorMessage = (error) => {
        try {
          if (error.response?.data) {
            const errorData = error.response.data;
            
            // Check for duration_minutes error
            if (errorData.duration_minutes) {
              return errorData.duration_minutes[0];
            }
            
            const firstErrorField = Object.keys(errorData)[0];
            if (firstErrorField && Array.isArray(errorData[firstErrorField])) {
              return errorData[firstErrorField][0];
            }
          }
          
          if (error.duration_minutes && Array.isArray(error.duration_minutes)) {
            return error.duration_minutes[0];
          }
          
          return 'An error occurred. Please try again.';
        } catch (e) {
          console.error('Error formatting error message:', e);
          return 'An error occurred. Please try again.';
        }
      };

      
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
            const errorMessage = formatErrorMessage(error.response?.data || error);
            setError(errorMessage);
        } finally {
            setUpdateLoading(false);
        }
    };
  
    return (
        <div
          onClick={handleClick}
          className="group border border-gray-800 bg-gradient-to-r from-[#1A1B2E] to-[#1E1F36] rounded-lg p-6 
                    hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 
                    transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 
                        group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 
                           bg-clip-text text-transparent group-hover:from-indigo-300 
                           group-hover:to-purple-300 transition-all duration-300">
                {request.title}
              </h2>
              <StatusDropdown
              currentStatus={request.status}
              onStatusChange={handleStatusChange}
              isOwner={isOwner}
            />
            </div>
    
            <p className="text-gray-300 mb-6 whitespace-pre-wrap">
              {truncateText(request.body_content, 24)}
            </p>
    
            <div className="flex flex-wrap gap-2 mb-4">
              {request.tags.map((tagObj, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-full 
                           bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  <Tag size={14} />
                  {tagObj.tag.name}
                </span>
              ))}
            </div>
    
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
    
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <UserCheck size={16} />
              <span>
                Requested by {request.user?.username}{" "}
                {formatDistanceToNow(new Date(request.created_at))} ago
              </span>
            </div>
    
            {isOwner && <ProposalCount count={request.schedule_proposals_count} />}
    
            <div className="flex justify-end gap-4 mt-4">
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
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 
                             text-white hover:shadow-lg hover:shadow-indigo-500/20 
                             transition-all duration-300"
                  >
                    Propose Schedule
                  </button>
                  {isScheduleModalOpen && (
                    <ScheduleProposal
                      isOpen={isScheduleModalOpen}
                      onClose={() => setIsScheduleModalOpen(false)}
                      requestId={request.id}
                      onScheduleProposed={() => setIsScheduleModalOpen(false)}
                    />
                  )}
                </>
              )}
              {request.has_proposed && (
                <div className="px-3 py-1 rounded-md text-sm bg-green-500/20 text-green-400 
                             border border-green-500/20">
                  Scheduled
                </div>
              )}
              </div>
            </div>
          </div>
          {/* Error Toast */}
      <ErrorToast 
        message={error} 
        onDismiss={() => setError(null)} 
      />
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
            <div className="flex gap-2 mb-6 border-b border-gray-800">
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