import React from 'react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalRecords: number;
  indexOfFirstRow: number;
  indexOfLastRow: number;
  handlePageChange: (pageNumber: number) => void;
  handleRowsPerPageChange: (newRowsPerPage: number) => void;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalRecords,
  indexOfFirstRow,
  indexOfLastRow,
  handlePageChange,
  handleRowsPerPageChange
}) => {
  return (
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
  );
};