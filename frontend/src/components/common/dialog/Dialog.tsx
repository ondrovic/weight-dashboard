// src/components/common/dialog/Dialog.tsx
import React from 'react';
import { useDialog } from './hooks/useDialog';
import { DialogProps } from './types/dialog.types';
import { DialogHeader } from './components/DialogHeader';
import { DialogContent } from './components/DialogContent';
import { DialogFooter } from './components/DialogFooter';
import { DialogBackdrop } from './components/DialogBackdrop';

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  children,
  footer,
  onClose,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  width = 'max-w-lg',
  className = '',
}) => {
  const { 
    modalRef, 
    handleKeyDown
  } = useDialog({ 
    isOpen, 
    onClose, 
    closeOnEscape, 
    closeOnOutsideClick 
  });

  if (!isOpen) return null;

  return (
    <div 
      className="relative z-50" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={title ? "dialog-title" : undefined}
    >
      <DialogBackdrop />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <div
            ref={modalRef}
            onKeyDown={handleKeyDown}
            className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full ${width} border border-gray-300 dark:border-gray-600 ${className}`}
          >
            {title && <DialogHeader title={title} onClose={onClose} />}
            
            <DialogContent>
              {children}
            </DialogContent>
            
            {footer && <DialogFooter>{footer}</DialogFooter>}
          </div>
        </div>
      </div>
    </div>
  );
};