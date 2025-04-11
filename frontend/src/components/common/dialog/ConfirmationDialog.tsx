// src/components/dialog/ConfirmationDialog.tsx
import React from 'react';
import { Dialog } from './Dialog';
import { ConfirmationDialogProps } from './types/dialog.types';
import { WarningIcon } from '../icons/WarningIcon';

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}) => {
  // Determine style based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirm: 'bg-red-600 hover:bg-red-500 focus:ring-red-500',
          icon: 'text-red-600 dark:text-red-400'
        };
      case 'warning':
        return {
          confirm: 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500',
          icon: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'success':
        return {
          confirm: 'bg-green-600 hover:bg-green-500 focus:ring-green-500',
          icon: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          confirm: 'bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500',
          icon: 'text-indigo-600 dark:text-indigo-400'
        };
    }
  };

  const styles = getButtonStyles();

  // Split the message into paragraphs
  const messageContent = () => {
    if (!message) return null;
    
    // If message is a string, split by double newlines or handle as a single paragraph
    if (typeof message === 'string') {
      const paragraphs = message.split('\n\n');
      return paragraphs.map((paragraph, index) => (
        <p 
          key={index} 
          className={`text-sm text-gray-500 dark:text-gray-300 ${index > 0 ? 'mt-2' : ''}`}
        >
          {paragraph}
        </p>
      ));
    }
    
    // If message is already a React element, just return it
    return message;
  };

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
    >
      <div className="sm:flex sm:items-start">
        <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-${variant === 'default' ? 'indigo' : variant}-100 dark:bg-${variant === 'default' ? 'indigo' : variant}-900 sm:mx-0 sm:h-10 sm:w-10`}>
          <WarningIcon className={`h-6 w-6 ${styles.icon}`} />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <div className="mt-2">
            {messageContent()}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200 dark:border-gray-600 mt-4">
        <button
          type="button"
          className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm ${styles.confirm} sm:ml-3 sm:w-auto transition-colors duration-200`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 sm:mt-0 sm:w-auto transition-colors duration-200"
          onClick={onCancel}
        >
          {cancelText}
        </button>
      </div>
    </Dialog>
  );
};