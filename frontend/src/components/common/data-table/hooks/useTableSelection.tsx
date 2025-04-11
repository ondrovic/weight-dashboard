// Custom hook for table row selection functionality
import { useState, useRef, useEffect } from 'react';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Custom hook for managing table row selection
 */
export const useTableSelection = <T extends { id?: string }>(
  data: T[] | null | undefined,
  currentRows: T[]
) => {
  // Selection state
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const selectCheckboxRef = useRef<HTMLInputElement>(null);
  const selectionMenuRef = useRef<HTMLDivElement>(null);

  // Count selected rows
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  
  // Count selected rows on current page
  const currentPageSelectedCount = currentRows.reduce((count, row) => {
    if (row.id && selectedRows[row.id]) {
      return count + 1;
    }
    return count;
  }, 0);
  
  // Check if all rows on current page are selected
  const isCurrentPageAllSelected = currentPageSelectedCount === currentRows.filter(row => 
    row.id && isValidObjectId(row.id)
  ).length;

  // Update selectAll state when all valid records are selected
  useEffect(() => {
    if (!data) return;

    const validRecordCount = data.filter(row => row.id && isValidObjectId(row.id)).length;
    if (selectedCount === validRecordCount && validRecordCount > 0) {
      setSelectAll(true);
    } else if (selectAll && selectedCount < validRecordCount) {
      setSelectAll(false);
    }
  }, [selectedCount, data, selectAll]);

  // Close the selection menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectionMenuRef.current &&
        !selectionMenuRef.current.contains(event.target as Node) &&
        selectCheckboxRef.current &&
        !selectCheckboxRef.current.contains(event.target as Node)
      ) {
        setIsSelectionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle select all (across all pages)
  const handleSelectAll = () => {
    if (!data) return;
    
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedRows: Record<string, boolean> = {};
    if (newSelectAll) {
      data.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = true;
        }
      });
    }

    setSelectedRows(newSelectedRows);
  };

  // Handle select all on current page only
  const handleSelectCurrentPage = () => {
    const newSelectedRows = { ...selectedRows };

    if (isCurrentPageAllSelected) {
      currentRows.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = false;
        }
      });
    } else {
      currentRows.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = true;
        }
      });
    }

    setSelectedRows(newSelectedRows);

    if (!data) return;
    
    const allSelected = data.every(row =>
      row.id && isValidObjectId(row.id) ? newSelectedRows[row.id] : true
    );
    setSelectAll(allSelected);
  };

  // Handle row selection
  const handleRowSelect = (recordId: string) => {
    setSelectedRows(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // Toggle selection menu
  const toggleSelectionMenu = () => {
    setIsSelectionMenuOpen(!isSelectionMenuOpen);
  };

  // Clear selected rows
  const clearSelection = () => {
    setSelectedRows({});
    setSelectAll(false);
  };

  return {
    selectedRows,
    selectAll,
    selectedCount,
    isCurrentPageAllSelected,
    isSelectionMenuOpen,
    selectCheckboxRef,
    selectionMenuRef,
    handleSelectAll,
    handleSelectCurrentPage,
    handleRowSelect,
    toggleSelectionMenu,
    clearSelection
  };
};