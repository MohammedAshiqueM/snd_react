import React from 'react';

const RequestShimmer = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="border border-gray-700 bg-[#1A1B2E] rounded-lg p-4 relative animate-pulse w-full">
        {/* Top right timestamp */}
        <div className="absolute top-4 right-4">
          <div className="h-4 w-32 bg-gray-700 rounded" />
        </div>

        <div className="flex items-start space-x-4">
          {/* Left side stats column */}
          <div className="text-center space-y-2 w-16">
            {/* Votes */}
            <div className="h-6 w-8 bg-gray-700 rounded mx-auto" />
            <div className="h-4 w-12 bg-gray-700 rounded mx-auto" />
            
            {/* Check mark area */}
            <div className="h-5 w-5 bg-gray-700 rounded-full mx-auto mt-4" />
            
            {/* Answer count */}
            <div className="h-4 w-16 bg-gray-700 rounded mx-auto" />
            
            {/* Views */}
            <div className="h-4 w-8 bg-gray-700 rounded mx-auto mt-4" />
            <div className="h-4 w-14 bg-gray-700 rounded mx-auto" />
          </div>

          {/* Main content area */}
          <div className="flex-1">
            {/* Title */}
            <div className="h-6 w-3/4 bg-gray-700 rounded mb-4" />
            
            {/* Content preview */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-gray-700 rounded" />
              <div className="h-4 w-2/3 bg-gray-700 rounded" />
            </div>

            {/* Tags */}
            <div className="flex space-x-2">
              <div className="h-6 w-16 bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* Bottom right user info */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-gray-700" />
          <div className="h-4 w-24 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export default RequestShimmer;