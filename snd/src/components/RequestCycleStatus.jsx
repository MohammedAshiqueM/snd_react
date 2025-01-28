import React from 'react';
import { Clock, Calendar, UserCheck, CheckCircle } from 'lucide-react';

const RequestCycleStatus = ({ status, scheduleData }) => {
  const steps = [
    {
      id: 'request',
      label: 'Request Created',
      description: 'Class request is posted',
      icon: Calendar,
      isComplete: true
    },
    {
      id: 'proposals',
      label: 'Schedule Proposals',
      description: scheduleData?.proposals_count
        ? `${scheduleData.proposals_count} schedule(s) proposed`
        : 'Awaiting schedule proposals',
      icon: Clock,
      isComplete: scheduleData?.proposals_count > 0
    },
    {
      id: 'accepted',
      label: 'Schedule Accepted',
      description: scheduleData?.accepted_schedule
        ? `Session scheduled for ${new Date(scheduleData.accepted_schedule.time).toLocaleString()}`
        : 'Pending schedule acceptance',
      icon: CheckCircle,
      isComplete: status === 'AC'
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

  const getStatusColor = () => {
    switch (status) {
      case 'PE': return 'text-yellow-400';
      case 'AC': return 'text-green-400';
      case 'CO': return 'text-blue-400';
      case 'CA': return 'text-red-400';
      default: return 'text-gray-400';
    };
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-400">Request Progress</h3>
          <div className={`px-4 py-1 rounded-full text-sm ${
            status === 'PE' ? 'bg-yellow-500/20 text-yellow-400' :
            status === 'AC' ? 'bg-green-500/20 text-green-400' :
            status === 'CO' ? 'bg-blue-500/20 text-blue-400' :
            status === 'CA' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {status === 'PE' ? 'Pending' :
             status === 'AC' ? 'Accepted' :
             status === 'CO' ? 'Completed' :
             status === 'CA' ? 'Cancelled' :
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
                  className="text-blue-500 transition-all duration-1000 ease-out"
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
            {steps.map((step, index) => (
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

export default RequestCycleStatus;