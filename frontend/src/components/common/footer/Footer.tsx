// src/components/common/footer/Footer.tsx
import React from 'react';
import { useCopyrightYear } from './hooks/useCopyrightYear';
import { FooterProps } from './types/footer.types';

export const Footer: React.FC<FooterProps> = ({
  companyName = 'Tracker App',
  className = '',
}) => {
  const year = useCopyrightYear();

  return (
    <footer className={`bg-white dark:bg-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {year} {companyName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};