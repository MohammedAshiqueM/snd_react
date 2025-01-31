import React from 'react';

const RequestEndCallDialog = ({ isOpen, onClose, onConfirm, requesterRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            End Call Request
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {requesterRole === 'teacher' 
              ? "Your teacher has requested to end this session early. Would you like to accept?" 
              : "Your student has requested to end this session early. Would you like to accept?"}
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reject
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestEndCallDialog;