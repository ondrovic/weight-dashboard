import React from 'react';
import { SortableField } from '../hooks/useTableSort';

interface TableHeaderProps {
  visibleMetrics: Array<{
    key: string;
    name: string;
  }>;
  showActions: boolean;
  handleSortClick: (field: SortableField) => void;
  getSortIcon: (field: SortableField) => React.ReactNode;
  selectedCount: number;
  handleSelectAll: () => void;
  toggleSelectionMenu: () => void;
  isSelectionMenuOpen: boolean;
  selectionMenuRef: React.RefObject<HTMLDivElement>;
  selectCheckboxRef: React.RefObject<HTMLInputElement>;
  selectAll: boolean;
  handleSelectCurrentPage: () => void;
  clearSelection: () => void;
  totalRows: number;
  currentRowsCount: number;
}

export const TableHeader = ({
  visibleMetrics,
  showActions,
  handleSortClick,
  getSortIcon,
  selectedCount,
  handleSelectAll,
  toggleSelectionMenu,
  isSelectionMenuOpen,
  selectionMenuRef,
  selectCheckboxRef,
  selectAll,
  handleSelectCurrentPage,
  clearSelection,
  totalRows,
  currentRowsCount
}: TableHeaderProps) => {
  return (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {/* Selection controls */}
        <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
          <div className="relative group">
            <div className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCount > 0}
                onChange={handleSelectAll}
                ref={selectCheckboxRef}
                className={`h-4 w-4 border-gray-300 dark:border-gray-600 rounded ${selectAll
                  ? 'bg-indigo-600 text-indigo-600 focus:ring-indigo-500'
                  : selectedCount > 0
                    ? 'bg-indigo-600 text-indigo-600 focus:ring-indigo-500'
                    : 'focus:ring-indigo-500'
                  }`}
              />
              <svg
                className="ml-1 h-4 w-4 text-gray-500 dark:text-gray-400 cursor-pointer"
                viewBox="0 0 20 20"
                fill="currentColor"
                onClick={toggleSelectionMenu}
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Selection dropdown menu */}
            {isSelectionMenuOpen && (
              <div
                className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10"
                ref={selectionMenuRef}
              >
                <div className="py-1" role="menu" aria-orientation="vertical">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                    onClick={() => {
                      handleSelectAll();
                      toggleSelectionMenu();
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Select All ({totalRows})
                  </button>

                  {totalRows > currentRowsCount && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      role="menuitem"
                      onClick={() => {
                        handleSelectCurrentPage();
                        toggleSelectionMenu();
                      }}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      Select Page ({currentRowsCount})
                    </button>
                  )}

                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    role="menuitem"
                    onClick={() => {
                      clearSelection();
                      toggleSelectionMenu();
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </th>

        {showActions && (
          <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        )}

        {visibleMetrics.map(metric => (
          <th
            key={metric.key}
            scope="col"
            className="group px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => handleSortClick(metric.key as SortableField)}
          >
            <div className="flex items-center space-x-1">
              <span>{metric.name}</span>
              <span>{getSortIcon(metric.key as SortableField)}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};