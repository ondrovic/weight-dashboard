'use client';

import { toast, type ToastOptions, type ToastContent } from 'react-toastify';
import { ToastType, ToastPayload } from '../lib/toast.types';
import { DEFAULT_TOAST_OPTIONS } from '../lib/toast.defaults';

// ✅ Replace React.ReactText with `string | number`
const toastMap: Record<
  ToastType,
  (content: ToastContent<unknown>, options?: ToastOptions) => string | number
> = {
  success: toast.success,
  error: toast.error,
  info: toast.info,
  warning: toast.warning,
  default: toast,
};

export const useToast = () => {
  const showToast = ({ message, type = ToastType.Info, options }: ToastPayload) => {
    toastMap[type](message, {
      ...DEFAULT_TOAST_OPTIONS,
      ...options,
    });
  };

  return { showToast };
};
