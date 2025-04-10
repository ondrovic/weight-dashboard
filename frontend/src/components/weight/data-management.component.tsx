import React, { useState } from 'react';
import { useConfirmation } from '@/contexts/confirmation.context';
import { weightApi } from '@/services/api.service';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

interface DataManagementProps {
  onDataChange?: () => void;
  loading: boolean;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onDataChange,
  loading
}) => {
  const { confirm } = useConfirmation();
  const { showToast } = useToast();

  const [localLoading, setLocalLoading] = useState(false);
  const isLoading = loading || localLoading;

  // Export weight data
  const handleExport = async () => {
    try {
      setLocalLoading(true);
      await weightApi.exportWeightData();
      showToast({
        message: 'Data exported successfully. Check your downloads folder.',
        type: ToastType.Success,
      });
    } catch (err) {
      console.error('Export error:', err);
      showToast({
        message: 'Failed to export data. Please try again.',
        type: ToastType.Error,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  // Download empty template
  const handleDownloadTemplate = async () => {
    try {
      setLocalLoading(true);
      await weightApi.downloadWeightDataTemplate();
      showToast({
        message: 'Template downloaded successfully. Check your downloads folder.',
        type: ToastType.Success,
      });
    } catch (err) {
      console.error('Template download error:', err);
      showToast({
        message: 'Failed to download template. Please try again.',
        type: ToastType.Error,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  // Confirm and clear all weight data
  const handleClearData = async () => {
    try {
      const confirmed = await confirm({
        title: 'Clear All Data',
        message:
          'This action will permanently delete all your weight tracking data. This cannot be undone. Are you sure you want to continue?',
        confirmText: 'Yes, Delete Everything',
        cancelText: 'Cancel',
        variant: 'danger',
      });

      if (confirmed) {
        setLocalLoading(true);
        await weightApi.clearAllWeightData();
        showToast({
          message: 'All data has been cleared successfully.',
          type: ToastType.Success,
        });

        if (onDataChange) {
          onDataChange();
        }
      }
    } catch (err) {
      console.error('Clear data error:', err);
      showToast({
        message: 'An error occurred while clearing data.',
        type: ToastType.Error,
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Manage Your Data</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Data */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Export Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Download your data as a CSV file.</p>
          <button
            onClick={handleExport}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Download Template */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Download Template</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Get a CSV template.</p>
          <button
            onClick={handleDownloadTemplate}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Downloading...' : 'Download Template'}
          </button>
        </div>

        {/* Clear All Data */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Clear All Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Delete all your data. <strong>This action cannot be undone.</strong>
          </p>
          <button
            onClick={handleClearData}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
