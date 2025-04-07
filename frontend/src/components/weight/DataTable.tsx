// frontend/src/components/weight/DataTable.tsx
import React, { useState } from 'react';
import { WeightEntry } from '../../types/weightData';
import { formatValue } from '../../utils/calculations';
import { EditButton } from './EditButton';
import { DeleteButton } from './DeleteButton';
import { EditWeightForm } from './EditWeightForm';
import { useMetrics } from '../../contexts/MetricsContext';

// Type for sort direction
type SortDirection = 'asc' | 'desc';

// Type for sortable fields
type SortableField = keyof WeightEntry | '';

interface DataTableProps {
  data: WeightEntry[] | null | undefined;
  loading: boolean;
  onUpdateRecord?: (id: string, data: Partial<WeightEntry>) => Promise<boolean>;
  onDeleteRecord?: (id: string) => Promise<boolean>;
}

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  loading,
  onUpdateRecord,
  onDeleteRecord
}) => {
  const { availableMetrics, tableMetrics } = useMetrics();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<WeightEntry | null>(null);
  const [sortField, setSortField] = useState<SortableField>('Date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const rowsPerPage = 10;
  
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
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  
  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle edit button click
  const handleEditClick = (recordId: string, record: WeightEntry) => {
    setEditingRecordId(recordId);
    setEditingRecord(record);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditingRecordId(null);
    setEditingRecord(null);
  };

  // Handle delete click
  const handleDeleteClick = async (recordId: string) => {
    if (onDeleteRecord && isValidObjectId(recordId)) {
      await onDeleteRecord(recordId);
    } else {
      console.error("Cannot delete record with invalid ID:", recordId);
      alert("This record cannot be deleted because it doesn't have a valid database ID.");
    }
  };

  // If in edit mode, show edit form
  if (editingRecordId && editingRecord && onUpdateRecord) {
    return (
      <EditWeightForm
        recordId={editingRecordId}
        initialData={editingRecord}
        onUpdate={onUpdateRecord}
        onCancel={handleEditCancel}
        loading={loading}
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
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">History</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
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
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstRow + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastRow, sortedData.length)}
                </span>{' '}
                of <span className="font-medium">{sortedData.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="sr-only">Previous</span>
                  &larr;
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="sr-only">Next</span>
                  &rarr;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};