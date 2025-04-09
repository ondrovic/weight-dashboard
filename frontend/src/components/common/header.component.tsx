// frontend/src/components/common/Header.tsx
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Body Stats Dashboard</h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};