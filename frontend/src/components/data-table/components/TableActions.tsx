import React, { useState } from 'react';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

interface TableActionsProps {
  selectedCount: number;
  onExportSelected: () => Promise<void>;
  onDeleteSelected: () => Promise<void>;
}

export const TableActions: React.FC<TableActionsProps> = ({
  selectedCount,
  onExportSelected,
  onDeleteSelected,
}) => {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportSelected();
      showToast({
        message: 'Export started. Check your downloads folder.',
        type: ToastType.Success,
      });
    } catch (err) {
      console.error(err);
      showToast({
        message: 'Failed to export data.',
        type: ToastType.Error,
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDeleteSelected();
      // Toasts for delete assumed handled via confirmation dialog
    } catch (err) {
      console.error(err);
      showToast({
        message: 'An error occurred while deleting.',
        type: ToastType.Error,
      });
    } finally {
      setDeleting(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="flex space-x-2">
      <span className="text-sm text-gray-500 dark:text-gray-400 self-center ml-2">
        {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
      </span>

      <button
        onClick={handleExport}
        disabled={exporting}
        className={`px-3 py-1 text-sm rounded-md text-white transition ${
          exporting
            ? 'bg-blue-400 dark:bg-blue-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        }`}
      >
        {exporting ? 'Exporting...' : 'Export Selected'}
      </button>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className={`px-3 py-1 text-sm rounded-md text-white transition ${
          deleting
            ? 'bg-red-400 dark:bg-red-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
        }`}
      >
        {deleting ? 'Deleting...' : 'Delete Selected'}
      </button>
    </div>
  );
};
