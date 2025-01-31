import React, { useEffect } from 'react';

const ConfirmEndCallDialog = ({ isOpen, onClose, onConfirm, isTeacher }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            End Call?
          </h2>
          <p className="text-gray-300">
            {isTeacher 
              ? "Are you sure you want to end this teaching session? This will disconnect both you and your student."
              : "Are you sure you want to leave this session? You'll be prompted to rate your teacher afterward."}
          </p>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndCallDialog;