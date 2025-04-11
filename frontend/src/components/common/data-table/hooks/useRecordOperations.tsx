import { useState } from 'react';
import { useConfirmation } from '@/contexts/Confrimation';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Custom hook for handling record operations (edit, delete)
 */
export const useRecordOperations = <T extends { id?: string }>(
  onUpdateRecord?: (id: string, data: Partial<T>) => Promise<boolean>,
  onDeleteRecord?: (id: string) => Promise<boolean>,
  onDeleteMultipleRecords?: (ids: string[]) => Promise<boolean>
) => {
  const { confirm } = useConfirmation();
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);

  // Handle edit button click
  const handleEditClick = (recordId: string, record: T) => {
    setEditingRecordId(recordId);
    setEditingRecord(record);
  };

  // Handle update completion
  const handleUpdateComplete = async (data: Partial<T>): Promise<boolean> => {
    if (onUpdateRecord && editingRecordId) {
      const success = await onUpdateRecord(editingRecordId, data);
      if (success) {
        setEditingRecordId(null);
        setEditingRecord(null);
      }
      return success;
    }
    return false;
  };

  // Handle delete click
  const handleDeleteClick = async (recordId: string) => {
    if (onDeleteRecord && isValidObjectId(recordId)) {
      const confirmed = await confirm({
        title: 'Delete Record',
        message: 'Are you sure you want to delete this record? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      });

      if (confirmed) {
        return await onDeleteRecord(recordId);
      }
    } else {
      console.error("Cannot delete record with invalid ID:", recordId);
      alert("This record cannot be deleted because it doesn't have a valid database ID.");
    }
    return false;
  };

  // Handle delete selected
  const handleDeleteSelected = async (selectedRows: Record<string, boolean>, setSelectedRows: (rows: Record<string, boolean>) => void) => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);

    if (selectedIds.length === 0) {
      alert('No records selected.');
      return;
    }

    const confirmMessage = selectedIds.length === 1
      ? `Are you sure you want to delete 1 selected record? This action cannot be undone.`
      : `Are you sure you want to delete ${selectedIds.length} selected records? This action cannot be undone.`;

    const warningMessage = selectedIds.length > 25
      ? `\n\nYou are about to delete a large number of records (${selectedIds.length}). Please ensure this is what you want to do.`
      : '';

    if (onDeleteMultipleRecords) {
      const confirmed = await confirm({
        title: 'Delete Selected Records',
        message: confirmMessage + warningMessage,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      });

      if (confirmed) {
        try {
          const success = await onDeleteMultipleRecords(selectedIds);
          if (success) {
            setSelectedRows({});
            return true;
          }
        } catch (error) {
          console.error('Error deleting selected records:', error);
          alert('An error occurred while deleting the selected records.');
        }
      }
    } else if (onDeleteRecord) {
      // Fallback to deleting one by one
      const confirmed = await confirm({
        title: 'Delete Selected Records',
        message: confirmMessage + warningMessage,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      });

      if (confirmed) {
        try {
          for (const id of selectedIds) {
            await onDeleteRecord(id);
          }
          setSelectedRows({});
          return true;
        } catch (error) {
          console.error('Error during individual record deletion:', error);
          alert('An error occurred while deleting some records.');
        }
      }
    }
    return false;
  };

  return {
    editingRecordId,
    editingRecord,
    handleEditClick,
    handleUpdateComplete,
    handleDeleteClick,
    handleDeleteSelected,
    cancelEditing: () => {
      setEditingRecordId(null);
      setEditingRecord(null);
    }
  };
};