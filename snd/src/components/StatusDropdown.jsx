import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const StatusDropdown = ({ currentStatus, onStatusChange, isOwner }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    'DR': {
      color: 'bg-slate-600',
      hoverColor: 'hover:bg-slate-700',
      icon: '📝',
      label: 'Draft',
      description: 'Request is in draft mode',
      allowedTransitions: ['PE', 'CN']
    },
    'PE': {
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      icon: '⏳',
      label: 'Pending',
      description: 'Waiting for someone to accept',
      allowedTransitions: ['CN']
    },
    'AC': {
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600',
      icon: '📅',
      label: 'Accepted',
      description: 'Request has been accepted',
      allowedTransitions: []
    },
    'RJ': {
      color: 'bg-rose-500',
      hoverColor: 'hover:bg-rose-600',
      icon: '❌',
      label: 'Rejected',
      description: 'Request has been rejected',
      allowedTransitions: []
    },
    'CN': {
      color: 'bg-neutral-600',
      hoverColor: 'hover:bg-neutral-700',
      icon: '🚫',
      label: 'Cancelled',
      description: 'Request has been cancelled',
      allowedTransitions: []
    },
    'CP': {
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600',
      icon: '✅',
      label: 'Completed',
      description: 'Session has been completed',
      allowedTransitions: []
    }
  };

  const currentStatusConfig = statusConfig[currentStatus];
  const availableTransitions = currentStatusConfig?.allowedTransitions || [];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => isOwner && setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2
          px-4 py-2
          rounded-lg
          shadow-md hover:shadow-lg
          ${currentStatusConfig.color}
          ${isOwner && availableTransitions.length > 0 ? currentStatusConfig.hoverColor : ''}
          ${isOwner && availableTransitions.length > 0 ? 'cursor-pointer' : 'cursor-default'}
          transition-all duration-200 ease-in-out
        `}
        disabled={!isOwner || availableTransitions.length === 0}
      >
        <span className="text-lg leading-none">{currentStatusConfig.icon}</span>
        <span className="font-medium text-white">{currentStatusConfig.label}</span>
        {isOwner && availableTransitions.length > 0 && (
          <ChevronDown 
            className={`w-4 h-4 ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      {isOpen && availableTransitions.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {availableTransitions.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2
                  flex items-center gap-2
                  text-sm text-gray-700 dark:text-gray-200
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-200
                `}
              >
                <span className="text-lg leading-none">{statusConfig[status].icon}</span>
                <span>{statusConfig[status].label}</span>
                {currentStatus === status && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200
                    bg-gray-800 text-white text-sm
                    p-2 rounded-md 
                    -bottom-8 left-1/2 -translate-x-1/2
                    whitespace-nowrap z-10">
        {currentStatusConfig.description}
      </div>
    </div>
  );
};

export default StatusDropdown;