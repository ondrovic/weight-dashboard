// src/components/dialog/components/DialogContent.tsx
import React, { ReactNode } from 'react';

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export const DialogContent: React.FC<DialogContentProps> = ({ 
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 px-4 py-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};