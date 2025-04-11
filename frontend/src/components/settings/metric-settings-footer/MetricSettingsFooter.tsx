import React from 'react';

export interface MetricSettingsFooterProps {
  onSelectAll: () => void;
  onSelectNone: () => void;
  saveLabel: string;
  loading?: boolean;
}

export const MetricSettingsFooter: React.FC<MetricSettingsFooterProps> = ({
  onSelectAll,
  onSelectNone,
  saveLabel,
  loading = false,
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onSelectAll}
          disabled={loading}
          className={`text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Select All
        </button>
        <button
          type="button"
          onClick={onSelectNone}
          disabled={loading}
          className={`text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Select None
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`py-2 px-4 text-sm text-white rounded-md transition ${
          loading
            ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
        }`}
      >
        {saveLabel}
      </button>
    </div>
  );
};
