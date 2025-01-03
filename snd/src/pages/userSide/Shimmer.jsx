import React from 'react';

const Shimmer = () => {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-video bg-gray-700 rounded-lg"></div>
      <div className="mt-4 h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="mt-2 h-4 bg-gray-700 rounded w-1/2"></div>
      <div className="mt-4 flex space-x-2">
        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export default Shimmer;
