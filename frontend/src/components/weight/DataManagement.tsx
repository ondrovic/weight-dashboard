// src/components/weight/DataManagement.tsx
import React, { useState } from 'react';
import { useConfirmation } from '../../contexts/ConfirmationContext';

interface DataManagementProps {
  onExport: () => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
  onClearData: () => Promise<boolean>;
  loading: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onExport,
  onDownloadTemplate,
  onClearData,
  loading
}) => {
  const { confirm } = useConfirmation();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle export
  const handleExport = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await onExport();
      setSuccess('Data exported successfully. Check your downloads folder.');
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data. Please try again.');
    }
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      await onDownloadTemplate();
      setSuccess('Template downloaded successfully. Check your downloads folder.');
    } catch (err) {
      console.error('Template download error:', err);
      setError('Failed to download template. Please try again.');
    }
  };

  // Handle clear data with confirmation
  const handleClearData = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      const confirmed = await confirm({
        title: 'Clear All Data',
        message: 'This action will permanently delete all your weight tracking data. This cannot be undone. Are you sure you want to continue?',
        confirmText: 'Yes, Delete Everything',
        cancelText: 'Cancel',
        variant: 'danger'
      });
      
      if (confirmed) {
        const result = await onClearData();
        if (result) {
          setSuccess('All data has been cleared successfully.');
        } else {
          setError('Failed to clear data. Please try again.');
        }
      }
    } catch (err) {
      console.error('Clear data error:', err);
      setError('An error occurred while clearing data.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Manage Your Data</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-800 dark:text-green-300 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Export Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Download all your weight tracking data as a CSV file.
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md"
          >
            {loading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
        
        {/* Download Template */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Download Template</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get a CSV template with the correct headers that you can fill in and upload later.
          </p>
          <button
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md"
          >
            {loading ? 'Downloading...' : 'Download Template'}
          </button>
        </div>
        
        {/* Clear Data */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Clear All Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Delete all your weight tracking data. This action cannot be undone.
          </p>
          <button
            onClick={handleClearData}
            disabled={loading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md"
          >
            {loading ? 'Processing...' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};