// src/components/common/header/types/header.types.ts
import { ReactNode } from 'react';

export interface HeaderProps {
  /**
   * Header title text
   */
  title?: string;
  
  /**
   * Optional URL for logo image
   */
  logoUrl?: string;
  
  /**
   * Optional content to render on the left side of the header
   */
  leftContent?: ReactNode;
  
  /**
   * Optional content to render on the right side of the header
   */
  rightContent?: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}