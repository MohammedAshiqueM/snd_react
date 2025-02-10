import React from 'react';
import { Clock, Calendar, UserCheck, CheckCircle, XCircle } from 'lucide-react';

const ScheduleStatus = ({ status, scheduleData }) => {
  const steps = [
    {
      id: 'proposed',
      label: 'Schedule Proposed',
      description: scheduleData?.scheduled_time 
        ? `Proposed for ${new Date(scheduleData.scheduled_time).toLocaleString()}`
        : 'Time slot proposed',
      icon: Clock,
      isComplete: ['PE', 'AC', 'CO'].includes(status)
    },
    {
      id: 'accepted',
      label: 'Schedule Accepted',
      description: status === 'AC' || status === 'CO'
        ? `Session confirmed for ${new Date(scheduleData?.scheduled_time).toLocaleString()}`
        : 'Awaiting confirmation',
      icon: Calendar,
      isComplete: ['AC', 'CO'].includes(status)
    },
    {
      id: 'completed',
      label: 'Session Completed',
      description: status === 'CO'
        ? 'Time credits transferred'
        : 'Session not completed yet',
      icon: UserCheck,
      isComplete: status === 'CO'
    }
  ];

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.isComplete).length;
    return (completedSteps / steps.length) * 100;
  };

  // Special states for rejected or cancelled schedules
  if (status === 'RE' || status === 'CA') {
    return (
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-red-400">
              Schedule {status === 'RE' ? 'Rejected' : 'Cancelled'}
            </h3>
            <div className="bg-red-500/20 text-red-400 px-4 py-1 rounded-full text-sm">
              {status === 'RE' ? 'Rejected' : 'Cancelled'}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 rounded-lg bg-red-500/20">
              <XCircle className="text-red-400" size={20} />
            </div>
            <p className="text-gray-400 text-sm">
              {status === 'RE' 
                ? 'This schedule proposal was rejected.'
                : 'This schedule has been cancelled.'}
            </p>
          </div>
          {scheduleData?.note && (
            <div className="mt-4 p-3 rounded-lg bg-gray-700/30">
              <p className="text-sm text-gray-400">{scheduleData.note}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-400">Schedule Status</h3>
          <div className={`px-4 py-1 rounded-full text-sm ${
            status === 'PR' ? 'bg-yellow-500/20 text-yellow-400' :
            status === 'AC' ? 'bg-green-500/20 text-green-400' :
            status === 'CO' ? 'bg-blue-500/20 text-blue-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {status === 'PR' ? 'Proposed' :
             status === 'AC' ? 'Accepted' :
             status === 'CO' ? 'Completed' :
             'Unknown Status'}
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4">
          {/* Progress Circle */}
          <div className="row-span-2">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-700"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="48"
                  cy="48"
                />
                <circle
                  className={`${
                    status === 'PR' ? 'text-yellow-400' :
                    status === 'AC' ? 'text-green-400' :
                    status === 'CO' ? 'text-blue-400' :
                    'text-gray-400'
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="48"
                  cy="48"
                  style={{
                    strokeDasharray: 264,
                    strokeDashoffset: 264 - (264 * getProgressPercentage()) / 100,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(getProgressPercentage())}%</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`transform transition-all duration-300 ${
                  step.isComplete ? 'scale-100 opacity-100' : 'opacity-50'
                }`}
              >
                <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    step.isComplete ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    <step.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${
                      step.isComplete ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {step.description}
                    </p>
                  </div>
                  {step.isComplete && (
                    <CheckCircle className="text-green-400 flex-shrink-0" size={14} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleStatus;