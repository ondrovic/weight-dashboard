import React from 'react';

interface DeleteButtonProps {
  /** Click handler — parent should handle toast, API, confirmation, etc. */
  onClick: () => Promise<void> | void;
  /** Visual size of the button (padding + icon) */
  size?: 'small' | 'medium' | 'large';
  /** Additional classes for positioning, layout, etc. */
  className?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'p-1',
    medium: 'p-2',
    large: 'p-3',
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 rounded-md ${sizeClasses[size]} ${className}`}
      title="Delete"
      aria-label="Delete record"
    >
      <svg
        className={iconSizes[size]}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};
