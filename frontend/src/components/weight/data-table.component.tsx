// frontend/src/components/weight/DataTable.tsx
import React, { useState, useRef, useEffect } from 'react';
import { WeightEntry } from '../../types/weight-data.types';
import { formatValue } from '../../utils/caclulations.utils';
import { EditButton } from './edit-button.component';
import { DeleteButton } from './delete-button.component';
import { WeightDataForm } from './weight-data-form.component';
import { useMetrics } from '../../contexts/metrics.context';
import { useConfirmation } from '../../contexts/confgirmation.context';

// Type for sort direction
type SortDirection = 'asc' | 'desc';

// Type for sortable fields
type SortableField = keyof WeightEntry | '';

interface DataTableProps {
  data: WeightEntry[] | null | undefined;
  loading: boolean;
  onUpdateRecord?: (id: string, data: Partial<WeightEntry>) => Promise<boolean>;
  onDeleteRecord?: (id: string) => Promise<boolean>;
  onDeleteMultipleRecords?: (ids: string[]) => Promise<boolean>; // New prop for deleting multiple records
  onExportRecords?: (records: WeightEntry[]) => Promise<void>; // New prop for exporting selected records
}

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const DataTable: React.FC<DataTableProps> = ({
  data,
  loading,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteMultipleRecords,
  onExportRecords
}) => {
  const { availableMetrics, tableMetrics } = useMetrics();
  const { confirm } = useConfirmation(); // For confirmation dialogs
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<WeightEntry | null>(null);
  const [sortField, setSortField] = useState<SortableField>('Date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [isSelectionMenuOpen, setIsSelectionMenuOpen] = useState(false);
  const selectCheckboxRef = useRef<HTMLInputElement>(null);
  const selectionMenuRef = useRef<HTMLDivElement>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Handle possible null or undefined data
  const safeData = Array.isArray(data) ? data : [];

  // Handle sort column click
  const handleSortClick = (field: SortableField) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Otherwise, set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }

    // Reset to first page when sorting
    setCurrentPage(1);
  };

  // Get sort icon based on current sort field and direction
  const getSortIcon = (field: SortableField) => {
    if (field !== sortField) {
      return (
        <svg className="w-4 h-4 opacity-0 group-hover:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  // Helper function to parse dates for sorting
  const parseDate = (dateStr: string) => {
    try {
      if (!dateStr) return 0;
      const [month, day, year] = dateStr.split('-');
      if (!month || !day || !year) return 0;
      return new Date(`20${year}-${month}-${day}`).getTime();
    } catch (error) {
      console.error('Error parsing date:', error);
      return 0;
    }
  };

  // Sort the data based on current sort field and direction
  const sortedData = [...safeData].sort((a, b) => {
    if (sortField === '') return 0;

    // Special handling for Date field
    if (sortField === 'Date') {
      const dateA = parseDate(a.Date);
      const dateB = parseDate(b.Date);

      return sortDirection === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    }

    // For numeric fields
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    // For string fields
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Calculate pagination
  const totalRecords = sortedData.length;

  // If "All" is selected, show all records
  const effectiveRowsPerPage = rowsPerPage === -1 ? totalRecords : rowsPerPage;

  const totalPages = Math.ceil(totalRecords / effectiveRowsPerPage);

  // Reset to first page if current page is out of bounds after changing rows per page
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, totalPages, currentPage]);

  // Calculate start and end indices for current page
  const indexOfFirstRow = (currentPage - 1) * effectiveRowsPerPage;
  const indexOfLastRow = rowsPerPage === -1 ? totalRecords : Math.min(indexOfFirstRow + effectiveRowsPerPage, totalRecords);
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate how many items are selected on the current page
  const currentPageSelectedCount = currentRows.reduce((count, row) => {
    if (row.id && selectedRows[row.id]) {
      return count + 1;
    }
    return count;
  }, 0);

  // Check if all items on current page are selected
  const isCurrentPageAllSelected = currentPageSelectedCount === currentRows.filter(row => row.id && isValidObjectId(row.id)).length;

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page

    // Save preference to localStorage
    localStorage.setItem('weightTableRowsPerPage', newRowsPerPage.toString());
  };

  // Handle select all on current page only
  const handleSelectCurrentPage = () => {
    const newSelectedRows = { ...selectedRows };

    // Toggle based on current page selection status
    if (isCurrentPageAllSelected) {
      // If all selected, unselect all on current page
      currentRows.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = false;
        }
      });
    } else {
      // Otherwise, select all on current page
      currentRows.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = true;
        }
      });
    }

    setSelectedRows(newSelectedRows);

    // Update selectAll state
    const allSelected = sortedData.every(row =>
      row.id && isValidObjectId(row.id) ? newSelectedRows[row.id] : true
    );
    setSelectAll(allSelected);
  };

  // Handle edit button click
  const handleEditClick = (recordId: string, record: WeightEntry) => {
    setEditingRecordId(recordId);
    setEditingRecord(record);
  };

  // Handle update completion
  const handleUpdateComplete = async (data: Partial<WeightEntry>): Promise<boolean> => {
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
        await onDeleteRecord(recordId);

        // Also remove from selected rows if it was selected
        if (selectedRows[recordId]) {
          const newSelectedRows = { ...selectedRows };
          delete newSelectedRows[recordId];
          setSelectedRows(newSelectedRows);
        }
      }
    } else {
      console.error("Cannot delete record with invalid ID:", recordId);
      alert("This record cannot be deleted because it doesn't have a valid database ID.");
    }
  };

  // Handle row selection
  const handleRowSelect = (recordId: string) => {
    setSelectedRows(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // Handle select all (across all pages)
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);

    const newSelectedRows: Record<string, boolean> = {};
    if (newSelectAll) {
      // Select all rows across all pages
      sortedData.forEach(row => {
        if (row.id && isValidObjectId(row.id)) {
          newSelectedRows[row.id] = true;
        }
      });
    }

    setSelectedRows(newSelectedRows);
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);

    if (selectedIds.length === 0) {
      alert('No records selected.');
      return;
    }

    // Create a detailed confirmation message
    const confirmMessage = selectedIds.length === 1
      ? `Are you sure you want to delete 1 selected record? This action cannot be undone.`
      : `Are you sure you want to delete ${selectedIds.length} selected records? This will remove data across all pages, not just the current page. This action cannot be undone.`;

    // Show warning for large deletions
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
        // If deleting many records, show a processing message
        if (selectedIds.length > 10) {
          alert(`Deleting ${selectedIds.length} records. This may take a moment...`);
        }

        try {
          const success = await onDeleteMultipleRecords(selectedIds);
          if (success) {
            // Reset selection after successful deletion
            setSelectedRows({});
            setSelectAll(false);
            // Reset to first page if current page would be empty
            if (currentPage > 1 && (sortedData.length - selectedIds.length) <= (currentPage - 1) * rowsPerPage) {
              setCurrentPage(1);
            }
          }
        } catch (error) {
          console.error('Error deleting selected records:', error);
          alert('An error occurred while deleting the selected records.');
        }
      }
    } else if (onDeleteRecord) {
      // Fallback to deleting one by one if bulk delete not available
      const confirmed = await confirm({
        title: 'Delete Selected Records',
        message: confirmMessage + warningMessage,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger'
      });

      if (confirmed) {
        try {
          // Create a counter for progress
          let deletedCount = 0;
          const totalToDelete = selectedIds.length;

          // Show progress for larger deletions
          if (totalToDelete > 10) {
            alert(`Deleting ${totalToDelete} records one by one. This may take some time...`);
          }

          // Delete records one by one
          for (const id of selectedIds) {
            await onDeleteRecord(id);
            deletedCount++;

            // Update progress on every 10th deletion
            if (deletedCount % 10 === 0 && deletedCount < totalToDelete) {
              console.log(`Deleted ${deletedCount} of ${totalToDelete} records...`);
            }
          }

          // Reset selection after deletion
          setSelectedRows({});
          setSelectAll(false);

          // Reset to first page if current page would be empty
          if (currentPage > 1 && (sortedData.length - totalToDelete) <= (currentPage - 1) * rowsPerPage) {
            setCurrentPage(1);
          }
        } catch (error) {
          console.error('Error during individual record deletion:', error);
          alert('An error occurred while deleting some records. The process may have been partially completed.');
        }
      }
    }
  };

  // Handle export selected
  const handleExportSelected = async () => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);

    if (selectedIds.length === 0) {
      alert('No records selected for export.');
      return;
    }

    // Get selected records from all data (not just current page)
    const selectedRecords = sortedData.filter(record =>
      record.id && selectedIds.includes(record.id)
    );

    // Show progress for larger exports
    if (selectedRecords.length > 100) {
      alert(`Preparing to export ${selectedRecords.length} records. This may take a moment...`);
    }

    if (onExportRecords) {
      try {
        await onExportRecords(selectedRecords);
      } catch (error) {
        console.error('Error exporting selected records:', error);
        alert('Failed to export selected records.');
      }
    } else {
      // Fallback export method if callback not provided
      try {
        // Convert to CSV with proper headers and escaping
        const headers = tableMetrics.join(',');
        const rows = selectedRecords.map(record => {
          return tableMetrics
            .map(key => {
              const value = record[key as keyof WeightEntry];
              // Properly handle string values with commas by quoting them
              return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
            })
            .join(',');
        });

        const csvContent = [headers, ...rows].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `weight-data-export-${timestamp}.csv`);
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up the URL object
      } catch (error) {
        console.error('Error exporting selected records:', error);
        alert('Failed to export selected records.');
      }
    }
  };

  // Count selected rows
  const selectedCount = Object.values(selectedRows).filter(Boolean).length;

  // Load saved rows per page from localStorage
  useEffect(() => {
    const savedRowsPerPage = localStorage.getItem('weightTableRowsPerPage');
    if (savedRowsPerPage) {
      const parsedValue = parseInt(savedRowsPerPage, 10);
      if (!isNaN(parsedValue) && [10, 25, 50, 100, -1].includes(parsedValue)) {
        setRowsPerPage(parsedValue);
      }
    }
  }, []);

  // Toggle selection menu
  const toggleSelectionMenu = () => {
    setIsSelectionMenuOpen(!isSelectionMenuOpen);
  };

  // Close the menu when clicking outside
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

  // Update selectAll state when all valid records are selected
  useEffect(() => {
    // Count how many valid records exist in total
    const validRecordCount = sortedData.filter(row => row.id && isValidObjectId(row.id)).length;

    // If all valid records are selected, set selectAll to true
    if (selectedCount === validRecordCount && validRecordCount > 0) {
      setSelectAll(true);
    } else if (selectAll && selectedCount < validRecordCount) {
      // If selectAll is true but not all records are selected, update it
      setSelectAll(false);
    }
  }, [selectedCount, sortedData.length, selectAll]);

  // If in edit mode, show edit form
  if (editingRecordId && editingRecord && onUpdateRecord) {
    return (
      <WeightDataForm
        onSubmit={handleUpdateComplete}
        onCancel={() => {
          setEditingRecordId(null);
          setEditingRecord(null);
        }}
        initialData={editingRecord}
        recordId={editingRecordId}
        loading={loading}
        isEditMode={true}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weight History</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Check if we need to show the actions column
  const showActions = onUpdateRecord || onDeleteRecord;

  // Filter metrics to only show visible columns
  const visibleMetrics = availableMetrics.filter(metric =>
    tableMetrics.includes(metric.key)
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">History</h2>

        {/* Selection actions - only shown when items are selected */}
        {selectedCount > 0 && (
          <div className="flex space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 self-center mr-2">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>

            <button
              onClick={handleExportSelected}
              className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              title="Export selected records"
            >
              Export Selected
            </button>

            <button
              onClick={handleDeleteSelected}
              className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
              title="Delete selected records"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Selection controls - single checkbox with dropdown */}
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
                            setIsSelectionMenuOpen(false);
                          }}
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Select All ({sortedData.length})
                        </button>

                        {/* Only show "Select Page" option when there's more than one page */}
                        {totalPages > 1 && (
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                            role="menuitem"
                            onClick={() => {
                              handleSelectCurrentPage();
                              setIsSelectionMenuOpen(false);
                            }}
                          >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            Select Page ({currentRows.length})
                          </button>
                        )}

                        <button
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          role="menuitem"
                          onClick={() => {
                            setSelectedRows({});
                            setSelectAll(false);
                            setIsSelectionMenuOpen(false);
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentRows.map((row, index) => {
              // Generate a record ID if none exists
              const recordId = row.id || `record-${index}`;
              const hasValidId = row.id && isValidObjectId(row.id);
              const isSelected = hasValidId && selectedRows[row.id as string];

              return (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} 
                    ${isSelected ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : ''}`}
                >
                  {/* Row select checkbox */}
                  <td className="px-2 py-4 whitespace-nowrap">
                    {hasValidId && (
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleRowSelect(row.id as string)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                    )}
                  </td>

                  {showActions && (
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {onUpdateRecord && (
                          <EditButton
                            onClick={() => handleEditClick(recordId, row)}
                            size="small"
                          />
                        )}
                        {onDeleteRecord && hasValidId && (
                          <DeleteButton
                            onClick={() => handleDeleteClick(row.id as string)}
                            size="small"
                          />
                        )}
                      </div>
                    </td>
                  )}

                  {visibleMetrics.map(metric => {
                    const key = metric.key as keyof WeightEntry;
                    const value = row[key];
                    const unit = metric.unit;

                    // Skip rendering if value doesn't exist
                    if (value === undefined) return null;

                    // Special case for Date (not a number)
                    if (key === 'Date') {
                      return (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {value as string}
                        </td>
                      );
                    }

                    // For numeric values
                    if (typeof value === 'number') {
                      return (
                        <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatValue(value)} {unit}
                        </td>
                      );
                    }

                    // Fallback for any other type
                    return (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {String(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-3 mb-3 sm:mb-0">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Rows per page:
          </span>
          <select
            value={rowsPerPage}
            onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value, 10))}
            className="p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="-1">All</option>
          </select>

          <div className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 ml-4">
            Showing <span className="font-medium">{totalRecords > 0 ? indexOfFirstRow + 1 : 0}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastRow, totalRecords)}
            </span>{' '}
            of <span className="font-medium">{totalRecords}</span> results
          </div>
        </div>

        {/* Mobile results indicator */}
        <div className="sm:hidden text-sm text-gray-700 dark:text-gray-300 mb-3">
          Showing <span className="font-medium">{totalRecords > 0 ? indexOfFirstRow + 1 : 0}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastRow, totalRecords)}
          </span>{' '}
          of <span className="font-medium">{totalRecords}</span> results
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <div className="flex justify-center sm:justify-end">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>

              {totalPages <= 7 ? (
                // If we have 7 or fewer pages, show all page numbers
                [...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === i + 1
                      ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                // If we have more than 7 pages, show a truncated version
                <>
                  {/* Always show first page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === 1
                      ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    1
                  </button>

                  {/* Show ellipsis if not on pages 1-3 */}
                  {currentPage > 3 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      &hellip;
                    </span>
                  )}

                  {/* Show current page and surrounding pages */}
                  {Array.from({ length: 3 }, (_, i) => {
                    // Calculate the page number
                    let pageNum;
                    if (currentPage <= 3) {
                      // Near the start
                      pageNum = i + 2;
                    } else if (currentPage >= totalPages - 2) {
                      // Near the end
                      pageNum = totalPages - 4 + i;
                    } else {
                      // In the middle
                      pageNum = currentPage - 1 + i;
                    }

                    // Only render if within range
                    if (pageNum > 1 && pageNum < totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === pageNum
                            ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-200'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Show ellipsis if not on last 3 pages */}
                  {currentPage < totalPages - 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                      &hellip;
                    </span>
                  )}

                  {/* Always show last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${currentPage === totalPages
                      ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};