// frontend/src/components/weight/DeleteButton.tsx
import React, { useState } from 'react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface DeleteButtonProps {
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  size = 'medium',
  className = ''
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
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
  
  // Handle delete click
  const handleClick = () => {
    setShowConfirmation(true);
  };
  
  // Handle confirm delete
  const handleConfirm = () => {
    onClick();
    setShowConfirmation(false);
  };
  
  // Handle cancel delete
  const handleCancel = () => {
    setShowConfirmation(false);
  };
  
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 rounded-md ${sizeClasses[size]} ${className}`}
        title="Delete"
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
      
      {/* Modal Confirmation Dialog */}
      <ConfirmationDialog
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isOpen={showConfirmation}
      />
    </>
  );
};