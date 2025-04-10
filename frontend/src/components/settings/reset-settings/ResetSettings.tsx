import React from 'react';

interface ResetSettingsProps {
  title?: string;
  description?: string;
  onReset: () => void;
  loading?: boolean;
  buttonText?: string;
}

export const ResetSettings: React.FC<ResetSettingsProps> = ({
  title = 'Reset Settings',
  description = 'Reset all settings to their default values. This will affect your table columns, chart metrics, default visible metrics, and goals.',
  onReset,
  loading = false,
  buttonText = 'Reset All Settings',
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>

      <button
        onClick={onReset}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white transition ${
          loading
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};
