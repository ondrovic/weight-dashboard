// src/components/common/tabs/components/TabItem.tsx
import React from 'react';
import { Tab } from '../types/tabs.types';
import { getTabIcon } from '../utils/getTabIcon';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onClick }) => {
  return (
    <button
      className={`py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center mr-8 
        ${isActive
          ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-300'
          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
        }`}
      onClick={onClick}
    >
      {tab.icon && (
        <span className="mr-2">
          {getTabIcon(tab.icon)}
        </span>
      )}
      {tab.label}
    </button>
  );
};