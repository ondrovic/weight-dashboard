import React from 'react';

interface TableActionsProps {
  selectedCount: number;
  onExportSelected: () => Promise<void>;
  onDeleteSelected: () => Promise<void>;
}

export const TableActions: React.FC<TableActionsProps> = ({
  selectedCount,
  onExportSelected,
  onDeleteSelected
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 self-center ml-2">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <button
        onClick={onExportSelected}
        className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
      >
        Export Selected
      </button>

      <button
        onClick={onDeleteSelected}
        className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
      >
        Delete Selected
      </button>
    </div>
  );
};