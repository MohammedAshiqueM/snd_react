import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const RejectionNotification = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="flex items-center justify-between bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
        <span className="text-sm font-medium pr-8">{message}</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RejectionNotification;