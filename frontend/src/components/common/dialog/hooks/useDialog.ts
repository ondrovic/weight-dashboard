// src/components/dialog/hooks/useDialog.ts
import { useEffect, useRef } from 'react';

interface UseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

export const useDialog = ({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnOutsideClick = true,
}: UseDialogProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape') {
      onClose();
    }
  };

  // Handle clicking outside the dialog
  const handleOutsideClick = (event: MouseEvent) => {
    if (
      closeOnOutsideClick &&
      modalRef.current && 
      !modalRef.current.contains(event.target as Node)
    ) {
      onClose();
    }
  };

  // Add/remove body scroll lock and event listeners
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
      
      // Add event listener for outside clicks
      if (closeOnOutsideClick) {
        document.addEventListener('mousedown', handleOutsideClick);
      }
    }

    return () => {
      // Re-enable scrolling when dialog closes
      document.body.style.overflow = '';
      
      // Remove event listener
      if (closeOnOutsideClick) {
        document.removeEventListener('mousedown', handleOutsideClick);
      }
    };
  }, [isOpen, closeOnOutsideClick, onClose]);

  return {
    modalRef,
    handleKeyDown,
    handleOutsideClick,
  };
};