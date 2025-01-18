import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const ScheduleList = ({ requestId, isOwner }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`/api/schedules/?request=${requestId}`);
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update schedule');
      
      // Refresh schedules after update
      fetchSchedules();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [requestId]);

  if (loading) return <div className="text-gray-400">Loading schedules...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!schedules.length) return <div className="text-gray-400">No schedules proposed yet.</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-400 mb-4">
        Proposed Schedules
      </h3>
      
      {schedules.map((schedule) => (
        <div 
          key={schedule.id}
          className="border border-gray-700 rounded-lg p-4 bg-[#1A1B2E]"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-gray-200">
                <Calendar size={16} />
                <span>
                  {format(new Date(schedule.scheduled_time), 'PPP p')}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Proposed by {schedule.teacher.username}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && schedule.status === 'PR' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(schedule.id, 'AC')}
                    className="p-2 rounded-full hover:bg-green-500/20 text-green-400"
                    title="Accept"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(schedule.id, 'RE')}
                    className="p-2 rounded-full hover:bg-red-500/20 text-red-400"
                    title="Reject"
                  >
                    <X size={16} />
                  </button>
                </>
              )}
              <span className={`px-3 py-1 rounded-full text-sm ${
                schedule.status === 'PR' ? 'bg-yellow-500/20 text-yellow-400' :
                schedule.status === 'AC' ? 'bg-green-500/20 text-green-400' :
                schedule.status === 'RE' ? 'bg-red-500/20 text-red-400' :
                schedule.status === 'CO' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {schedule.status === 'PR' ? 'Proposed' :
                 schedule.status === 'AC' ? 'Accepted' :
                 schedule.status === 'RE' ? 'Rejected' :
                 schedule.status === 'CO' ? 'Completed' :
                 'Cancelled'}
              </span>
            </div>
          </div>
          
          {schedule.note && (
            <div className="text-gray-300 mt-2 p-3 bg-[#0A0B1A] rounded">
              {schedule.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleList;