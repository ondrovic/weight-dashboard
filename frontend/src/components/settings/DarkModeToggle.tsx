// frontend/src/components/settings/DarkModeToggle.tsx
import React from 'react';
import { useDarkMode } from '../../contexts/DarkModeProvider';

export const DarkModeToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">Display Theme</h2>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
        
        <button
          type="button"
          className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            darkMode ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
          onClick={toggleDarkMode}
        >
          <span className="sr-only">Toggle dark mode</span>
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
              darkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Toggle between light and dark theme. Your preference will be saved for future visits.
      </p>
    </div>
  );
};