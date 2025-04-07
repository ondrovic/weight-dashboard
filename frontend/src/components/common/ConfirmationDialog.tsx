// frontend/src/components/common/ConfirmationDialog.tsx
import React from 'react';

interface ConfirmationDialogProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  position = 'right',
  width = 'w-48'
}) => {
  // Determine position classes
  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };
  
  return (
    <div className={`absolute z-10 ${positionClasses[position]} ${width} bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 text-sm transition-colors duration-200`}>
      <div className="px-4 py-2 text-gray-700 dark:text-gray-300">{message}</div>
      <div className="flex px-4 py-2 space-x-2">
        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded-md"
        >
          {confirmText}
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-md"
        >
          {cancelText}
        </button>
      </div>
    </div>
  );
};