import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="ml-3 text-lg text-gray-700">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;