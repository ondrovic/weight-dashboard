// src/components/dialog/components/DialogFooter.tsx
import React, { ReactNode } from 'react';

interface DialogFooterProps {
  children: ReactNode;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ 
  children,
  className = '',
}) => {
  return (
    <div className={`bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-600 ${className}`}>
      {children}
    </div>
  );
};