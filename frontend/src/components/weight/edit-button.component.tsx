// frontend/src/components/weight/EditButton.tsx
import React from 'react';

interface EditButtonProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  size = 'medium',
  className = ''
}) => {
  // Determine button size
  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3'
  };
  
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 rounded-md ${sizeClasses[size]} ${className}`}
      title="Edit"
    >
      <svg
        className={iconSizes[size]}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>
  );
};