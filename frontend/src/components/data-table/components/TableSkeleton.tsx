import React from 'react';

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
    </div>
  );
};