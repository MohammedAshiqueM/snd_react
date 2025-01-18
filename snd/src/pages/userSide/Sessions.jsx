import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, formatDistance } from 'date-fns';
import { Tag, Clock, UserCheck, Calendar, MessageSquare, Video } from 'lucide-react';
import RequestShimmer from '../../components/RequestShimmer';
import useSearchStore from '../../store/useSearchStore';
import { learningSession, teachingSession } from '../../wsApi';
import SideBar from '../../components/SideBar';
import NavBar from '../../components/NavBar';
import SessionRequestModal from '../../components/SessionRequestModal';
import Paginator from '../../components/Paginator';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-lg font-semibold rounded-t-lg transition-colors duration-200 ${
      active 
        ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
        : 'bg-transparent text-gray-500 hover:text-gray-400'
    }`}
  >
    {children}
  </button>
);

const JoinButton = ({ scheduledTime }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [canJoin, setCanJoin] = useState(false);
    const [countdown, setCountdown] = useState('');
  
    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date();
        const scheduleTime = new Date(scheduledTime);
        const difference = scheduleTime - now;
  
        // Allow joining 5 minutes before and up to 30 minutes after scheduled time
        const canJoinNow = difference <= 5 * 60 * 1000 && difference >= -30 * 60 * 1000;
        setCanJoin(canJoinNow);
  
        // Calculate countdown
        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
          setCountdown(
            `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
          setTimeLeft(formatDistance(scheduleTime, now, { addSuffix: true }));
        } else if (difference >= -30 * 60 * 1000) {
          setTimeLeft('Session in progress');
          setCountdown('');
        } else {
          setTimeLeft('Session ended');
          setCountdown('');
        }
      };
  
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
  
      return () => clearInterval(timer);
    }, [scheduledTime]);
  
    return (
      <div className="flex flex-col items-end gap-2">
        {countdown && (
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Clock size={16} />
            Starts in: {countdown}
          </div>
        )}
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all duration-200 ${
            canJoin
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => canJoin && window.open('/meeting-room', '_blank')}
          disabled={!canJoin}
        >
          <Video size={16} />
          {canJoin ? 'Join Meeting' : timeLeft}
        </button>
      </div>
    );
  };

const ScheduleCard = ({ schedule }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (e.target.closest('button')) {
      e.stopPropagation();
      return;
    }
    navigate(`/requests/${schedule.request.id}`);
  };

  return (
    <div
      className="border border-gray-700 bg-gray-800 rounded-lg p-6 relative hover:border-blue-400 transition-colors duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-blue-400 hover:text-blue-300">
          {schedule.request.title}
        </h2>
        {/* <StatusBadge status={schedule.status} /> */}
      </div>

      {schedule.note && (
        <div className="flex items-start gap-2 mb-4 p-3 bg-gray-700 rounded-lg">
          <MessageSquare size={16} className="text-gray-400 mt-1" />
          <p className="text-gray-300">{schedule.note}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {schedule.request.tags?.map((tag, index) => (
          <span
            key={index}
            className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-900 text-blue-400"
          >
            <Tag size={14} />
            {tag.name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar size={16} />
          <span>
            {new Date(schedule.scheduled_time).toLocaleString()} ({schedule.timezone})
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <UserCheck size={16} />
          <span>
            {schedule.is_teacher ? `Student: ${schedule.student.username}` : `Teacher: ${schedule.teacher.username}`}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Created {formatDistanceToNow(new Date(schedule.request.created_at))} ago
        </div>
        {schedule.status === 'AC' && (
          <JoinButton scheduledTime={schedule.scheduled_time} />
        )}
      </div>
    </div>
  );
};

export default function Sessions() {
    const [activeTab, setActiveTab] = useState('teaching');
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState(null);
    
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const savedState = localStorage.getItem('isSidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
    const { 
      searchQuery, 
      selectedCategory, 
      currentPage,
      setCurrentPage,
      setSearchContext 
    } = useSearchStore();
    const requestsPerPage = 5;
    
    const handleSidebarToggle = () => {
        setIsSidebarCollapsed((prevState) => {
          const newState = !prevState;
          localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
          return newState;
        });
      };

    const fetchSchedules = async (page, category, query) => {
      setIsLoading(true);
      try {
        const params = {
        page,
        page_size: requestsPerPage,
        search: searchQuery,
        category: selectedCategory !== 'All' ? selectedCategory : ''
      };
  
        const response = await (activeTab === 'teaching' 
          ? teachingSession(params)
          : learningSession(params)
        );
  
        if (response) {
          setSchedules(response.results || []);
          setTotalPages(Math.ceil((response.count || 0) / 5));
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
  
    const handlePageChange = (newPage) => {
      if (newPage < 1 || newPage > totalPages) return;
      setCurrentPage(newPage);
    };
  
    // Effect to set search context when component mounts
    useEffect(() => {
      setSearchContext('sessions');
    }, []);
  
    // Effect to handle search and category changes
    useEffect(() => {
      fetchSchedules(currentPage, selectedCategory, searchQuery);
    }, [currentPage, selectedCategory, searchQuery, activeTab]);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
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
            active={activeTab === 'teaching'} 
            onClick={() => {
              setActiveTab('teaching');
              setCurrentPage(1);
            }}
          >
            Teaching Sessions
          </TabButton>
          <TabButton 
            active={activeTab === 'learning'} 
            onClick={() => {
              setActiveTab('learning');
              setCurrentPage(1);
            }}
          >
            Learning Sessions
          </TabButton>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: requestsPerPage }).map((_, index) => (
                <RequestShimmer key={index} />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No {activeTab === 'teaching' ? 'teaching' : 'learning'} sessions found.
              </p>
              {activeTab === 'teaching' && (
                <button 
                  onClick={() => setActiveTab('explore')}
                  className="mt-4 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Explore other requests →
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {schedules.map((schedule) => (
                  <ScheduleCard 
                    key={schedule.id} 
                    schedule={{
                      ...schedule,
                      is_teacher: activeTab === 'teaching'
                    }} 
                  />
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
