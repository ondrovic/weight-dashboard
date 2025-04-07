// frontend/src/hooks/useModal.ts
import { useState, useCallback } from 'react';

export interface UseModalReturnType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

/**
 * A custom hook for controlling modal state
 * @returns Object with isOpen state and functions to control the modal
 */
export const useModal = (initialState: boolean = false): UseModalReturnType => {
  const [isOpen, setIsOpen] = useState(initialState);
  
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};