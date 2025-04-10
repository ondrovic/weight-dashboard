import type { ToastOptions } from 'react-toastify';
import type { ReactElement } from 'react';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
  Default = 'default',
}

export interface ToastPayload {
  message: string | ReactElement;
  type?: ToastType;
  options?: ToastOptions;
}
