// Custom hook for table pagination functionality
import { useState, useEffect } from 'react';

/**
 * Custom hook for managing table pagination
 */
export const useTablePagination = <T extends any>(data: T[] | null | undefined) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // Calculate pagination values
  const totalRecords = data?.length || 0;
  const effectiveRowsPerPage = rowsPerPage === -1 ? totalRecords : rowsPerPage;
  const totalPages = Math.ceil(totalRecords / effectiveRowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * effectiveRowsPerPage;
  const indexOfLastRow = rowsPerPage === -1 ? totalRecords : Math.min(indexOfFirstRow + effectiveRowsPerPage, totalRecords);
  const currentRows = data ? data.slice(indexOfFirstRow, indexOfLastRow) : [];

  // Reset to first page if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [rowsPerPage, totalPages, currentPage]);

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

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    localStorage.setItem('weightTableRowsPerPage', newRowsPerPage.toString());
  };

  return {
    currentPage,
    rowsPerPage,
    totalRecords,
    totalPages,
    currentRows,
    indexOfFirstRow,
    indexOfLastRow,
    effectiveRowsPerPage,
    handlePageChange,
    handleRowsPerPageChange
  };
};