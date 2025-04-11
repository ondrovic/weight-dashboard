// src/components/dialog/types/dialog.types.ts
import { ReactNode } from 'react';

export interface DialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Dialog title (optional) */
  title?: string;
  /** Dialog content */
  children: ReactNode;
  /** Custom footer content (optional) */
  footer?: ReactNode;
  /** Handler called when dialog should close */
  onClose: () => void;
  /** Whether to close dialog when Escape key is pressed */
  closeOnEscape?: boolean;
  /** Whether to close dialog when clicking outside */
  closeOnOutsideClick?: boolean;
  /** Width class for the dialog (Tailwind class) */
  width?: string;
  /** Additional class names for the dialog */
  className?: string;
}

export type DialogVariant = 'default' | 'danger' | 'warning' | 'success';

export interface ConfirmationDialogProps {
  /** Controls dialog visibility */
  isOpen: boolean;
  /** Dialog title */
  title?: string;
  /** Confirmation message (string or ReactNode) */
  message: string | ReactNode;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Handler called when confirmed */
  onConfirm: () => void;
  /** Handler called when canceled */
  onCancel: () => void;
  /** Style variant for the dialog */
  variant?: DialogVariant;
}