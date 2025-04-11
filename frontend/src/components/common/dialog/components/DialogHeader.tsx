// src/components/dialog/components/DialogHeader.tsx
import React from 'react';
import { XIcon } from '../../icons/XIcon';

interface DialogHeaderProps {
  title: string;
  onClose?: () => void;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
      <h3 
        className="text-lg font-semibold leading-6 text-gray-900 dark:text-white" 
        id="dialog-title"
      >
        {title}
      </h3>
      {onClose && (
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};