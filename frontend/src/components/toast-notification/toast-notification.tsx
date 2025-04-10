'use client';

import { ToastProvider } from './context/toast-context';
import { ToastContainerComponent } from './components/toast-container';

export const ToastNotification = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <ToastContainerComponent />
    {children}
  </ToastProvider>
);
