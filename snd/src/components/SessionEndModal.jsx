import React from 'react';
import { Clock, X } from 'lucide-react';

const SessionEndModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md bg-gray-800 rounded-xl shadow-xl p-6 m-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            Session Time Completed
          </h3>
          
          <p className="text-gray-300 mb-6">
            The scheduled session time has ended. You can now close this window.
          </p>

          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionEndModal;