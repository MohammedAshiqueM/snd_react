import React, { useEffect, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Clock, User, Calendar, Check, X } from 'lucide-react';
import { getSchedulesForRequest, updateScheduleStatus } from '../../wsApi';

// Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, action, schedule }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#1A1B2E] border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-xl font-semibold mb-2">
            Confirm {action === 'accept' ? 'Accept' : 'Reject'}
          </h3>
          <p className="text-gray-400 mb-6">
            Are you sure you want to {action === 'accept' ? 'accept' : 'reject'} the schedule proposed by {schedule?.teacher?.username}?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md ${
                action === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

// Component to show number of proposals on the request card
export const ProposalCount = ({ count }) => {
  if (!count && count !== 0) return null;
  
  return (
    <div className="flex items-center gap-2 text-gray-400 mt-2">
      <Calendar size={16} />
      <span>{count} schedule proposal{count !== 1 ? 's' : ''}</span>
    </div>
  );
};

// Component to show list of proposals in request details
const ProposedSchedules = ({ requestId }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await getSchedulesForRequest(requestId);
        // const data = await response.json();
        setSchedules(response);
      } catch (err) {
        setError('Failed to load schedules');
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [requestId]);

  const openConfirmationModal = (schedule, action) => {
    setSelectedSchedule(schedule);
    setSelectedAction(action);
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSchedule || !selectedAction) return;
    
    const scheduleId = selectedSchedule.id;
    const newStatus = selectedAction === 'accept' ? 'AC' : 'RE';

    setSchedules(prevSchedules =>
      prevSchedules.map(schedule =>
        schedule.id === scheduleId 
          ? { ...schedule, status: newStatus }
          : schedule
      )
    );

    try {
      const response = await updateScheduleStatus(scheduleId, newStatus);
      
      if (!response.ok) {
        setSchedules(prevSchedules =>
          prevSchedules.map(schedule =>
            schedule.id === scheduleId 
              ? { ...schedule, status: schedule.status }
              : schedule
          )
        );
        throw new Error('Failed to update schedule');
      }
      
      const updatedSchedule = await response.json();
      setSchedules(prevSchedules =>
        prevSchedules.map(schedule =>
          schedule.id === scheduleId ? updatedSchedule : schedule
        )
      );
    } catch (err) {
      console.error('Error updating schedule:', err);
    } finally {
      setModalOpen(false);
      setSelectedSchedule(null);
      setSelectedAction(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Proposed Schedules</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-[#1A1B2E] border border-gray-700 rounded-lg p-4 h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-red-400">
        <h2 className="text-xl font-semibold mb-4">Proposed Schedules</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!schedules?.length) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Proposed Schedules</h2>
        <p className="text-gray-400">No schedule proposals yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Proposed Schedules</h2>
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div 
            key={schedule.id}
            className="bg-[#1A1B2E] border border-gray-700 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <User size={20} className="text-blue-400" />
                <div>
                  <h3 className="font-medium">{schedule.teacher.username}</h3>
                  <p className="text-sm text-gray-400">
                    Proposed {formatDistanceToNow(new Date(schedule.request.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {schedule.status === 'PR' && (
                  <>
                    <button
                      onClick={() => openConfirmationModal(schedule, 'accept')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      onClick={() => openConfirmationModal(schedule, 'reject')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </>
                )}
                {schedule.status !== 'PR' && (
                  <span className={`px-3 py-1 rounded-md text-sm ${
                    schedule.status === 'AC' ? 'bg-green-900/50 text-green-400' :
                    schedule.status === 'RE' ? 'bg-red-900/50 text-red-400' :
                    schedule.status === 'CO' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-gray-900/50 text-gray-400'
                  }`}>
                    {schedule.status === 'AC' ? 'Accepted' :
                     schedule.status === 'RE' ? 'Rejected' :
                     schedule.status === 'CO' ? 'Completed' :
                     'Cancelled'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-400" />
                <span>{format(new Date(schedule.scheduled_time), 'PPp')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-400" />
                <span>{schedule.timezone}</span>
              </div>
            </div>
            {schedule.note && (
              <p className="mt-3 text-gray-400">{schedule.note}</p>
            )}
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSchedule(null);
          setSelectedAction(null);
        }}
        onConfirm={handleStatusUpdate}
        action={selectedAction}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default ProposedSchedules; //this is using inside the sessionDetails.jsx