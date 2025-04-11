import React from 'react';

interface EmptyDataStateProps {
  message: string;
}

export const EmptyDataState: React.FC<EmptyDataStateProps> = ({ message }) => {
  return (
    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
};