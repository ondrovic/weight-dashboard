// Custom hook for table sorting functionality
import { useState, useMemo } from 'react';

// Type definitions
export type SortDirection = 'asc' | 'desc';
export type SortableField = keyof any | '';

/**
 * Custom hook for sorting table data
 */
export const useTableSort = <T extends Record<string, any>>(
  data: T[] | null | undefined,
  parseDate: (dateStr: string) => number
) => {
  const [sortField, setSortField] = useState<SortableField>('Date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle column header click for sorting
  const handleSortClick = (field: SortableField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort the data based on current sort field and direction
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      if (sortField === '') return 0;

      // Special handling for Date field
      if (sortField === 'Date') {
        const dateA = parseDate(a.Date);
        const dateB = parseDate(b.Date);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // For numeric fields
      const aValue = a[sortField as keyof T];
      const bValue = b[sortField as keyof T];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // For string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [data, sortField, sortDirection, parseDate]);

  // Helper to get appropriate sort icon
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

  return {
    sortField,
    sortDirection,
    sortedData,
    handleSortClick,
    getSortIcon
  };
};