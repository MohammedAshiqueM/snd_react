import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const StatusDropdown = ({ currentStatus, onStatusChange, isOwner }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    'DR': {
      gradient: 'from-slate-500 to-slate-600',
      hoverGradient: 'hover:from-slate-600 hover:to-slate-700',
      icon: '📝',
      label: 'Draft',
      description: 'Request is in draft mode',
      allowedTransitions: ['PE', 'CA']
    },
    'PE': {
      gradient: 'from-amber-400 to-amber-500',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-600',
      icon: '⏳',
      label: 'Publish',
      description: 'Waiting for someone to accept',
      allowedTransitions: ['CA']
    },
    'AC': {
      gradient: 'from-emerald-400 to-emerald-500',
      hoverGradient: 'hover:from-emerald-500 hover:to-emerald-600',
      icon: '📅',
      label: 'Accepted',
      description: 'Request has been accepted',
      allowedTransitions: []
    },
    'RJ': {
      gradient: 'from-rose-400 to-rose-500',
      hoverGradient: 'hover:from-rose-500 hover:to-rose-600',
      icon: '❌',
      label: 'Rejected',
      description: 'Request has been rejected',
      allowedTransitions: []
    },
    'CA': {
      gradient: 'from-neutral-500 to-neutral-600',
      hoverGradient: 'hover:from-neutral-600 hover:to-neutral-700',
      icon: '🚫',
      label: 'Cancelled',
      description: 'Request has been cancelled',
      allowedTransitions: []
    },
    'CO': {
      gradient: 'from-sky-400 to-sky-500',
      hoverGradient: 'hover:from-sky-500 hover:to-sky-600',
      icon: '✅',
      label: 'Completed',
      description: 'Session has been completed',
      allowedTransitions: []
    },
    'SC': {
      gradient: 'from-sky-400 to-sky-500',
      hoverGradient: 'hover:from-sky-500 hover:to-sky-600',
      icon: '📰',
      label: 'Scheduled',
      description: 'Session is scheduled',
      allowedTransitions: []
    }
  };

  const currentStatusConfig = statusConfig[currentStatus];
  const availableTransitions = currentStatusConfig?.allowedTransitions || [];
  const isInteractive = isOwner && availableTransitions.length > 0;

  return (
    <div className="relative inline-block group">
      <button
        onClick={() => isInteractive && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          bg-gradient-to-r ${currentStatusConfig.gradient}
          ${isInteractive ? `${currentStatusConfig.hoverGradient} shadow-lg hover:shadow-xl 
          hover:shadow-current/10` : ''}
          ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
          border border-white/10
          transition-all duration-300
        `}
        disabled={!isInteractive}
      >
        <span className="text-lg leading-none">{currentStatusConfig.icon}</span>
        <span className="font-medium text-white">{currentStatusConfig.label}</span>
        {isInteractive && (
          <ChevronDown 
            className={`w-4 h-4 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && availableTransitions.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-xl 
                     bg-[#1A1B2E] border border-gray-700
                     transform origin-top scale-95 animate-in slide-in-from-top-2 duration-200 z-50">
          <div className="py-1">
            {availableTransitions.map((status) => {
              const config = statusConfig[status];
              return (
                <button
                  key={status}
                  onClick={() => {
                    onStatusChange(status);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full px-4 py-2
                    flex items-center gap-2
                    text-sm text-gray-200
                    hover:bg-gradient-to-r ${config.gradient} hover:text-white
                    transition-all duration-300
                  `}
                >
                  <span className="text-lg leading-none">{config.icon}</span>
                  <span>{config.label}</span>
                  {currentStatus === status && (
                    <Check className="w-4 h-4 ml-auto text-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 
                    transition-all duration-300
                    bg-[#1A1B2E] text-gray-200 text-sm
                    p-2 rounded-lg border border-gray-700
                    -bottom-12 left-1/2 -translate-x-1/2
                    whitespace-nowrap z-10
                    shadow-xl">
        {currentStatusConfig.description}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 
                      border-8 border-transparent border-b-[#1A1B2E]" />
      </div>
    </div>
  );
};

export default StatusDropdown;