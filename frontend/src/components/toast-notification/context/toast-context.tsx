'use client';

import React, { createContext, useContext } from 'react';
import { ToastPayload } from '../lib/toast.types';
import { useToast } from '../hooks/use-toast';

interface ToastContextValue {
  showToast: (payload: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastContext must be used within a ToastProvider');
  return context;
};
