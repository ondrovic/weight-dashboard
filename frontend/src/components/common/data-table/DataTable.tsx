import React, { useEffect } from 'react';
import { WeightEntry } from '@/types/weight-data.types';
import { WeightDataForm } from '@/components/weight/DataForm';
import { useMetrics } from '@/contexts/Metrics';
import { FilterManager } from './filter/FilterManager';
import { FilterCondition, FieldType } from './filter/types/filter.types';
import { applyFilters } from './filter/utils/filter';

// Import the new components and hooks
import { useTableSort } from './hooks/useTableSort';
import { useTablePagination } from './hooks/useTablePagination';
import { useTableSelection } from './hooks/useTableSelection';
import { useRecordOperations } from './hooks/useRecordOperations';
import { useDataExport } from './hooks/useDataExport';
import { TableHeader } from './components/TableHeader';
import { TableRow } from './components/TableRow';
import { TablePagination } from './components/TablePagination';
import { TableActions } from './components/TableActions';
import { TableSkeleton } from './components/TableSkeleton';
import { EmptyDataState } from './components/EmptyDataState';

interface DataTableProps {
  data: WeightEntry[] | null | undefined;
  loading: boolean;
  onUpdateRecord?: (id: string, data: Partial<WeightEntry>) => Promise<boolean>;
  onDeleteRecord?: (id: string) => Promise<boolean>;
  onDeleteMultipleRecords?: (ids: string[]) => Promise<boolean>;
  onExportRecords?: (records: WeightEntry[]) => Promise<void>;
}

// Helper function to parse dates for sorting
const parseDate = (dateStr: string): number => {
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

export const DataTable: React.FC<DataTableProps> = ({
  data,
  loading,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteMultipleRecords,
  onExportRecords
}) => {
  const { availableMetrics, tableMetrics } = useMetrics();

  // Handle safe data
  const safeData = Array.isArray(data) ? data : [];

  // Filter state
  const [filterConditions, setFilterConditions] = React.useState<FilterCondition[]>([]);
  const [filteredData, setFilteredData] = React.useState<WeightEntry[]>([]);

  // Get field type for filtering
  const getFieldType = (field: string): FieldType => {
    if (field === 'Date') return 'date';
    return 'number';
  };

  // Apply filters when data or filter conditions change
  useEffect(() => {
    if (filterConditions.length === 0 || !filterConditions.some(f => f.active)) {
      setFilteredData(safeData);
    } else {
      try {
        const filtered = applyFilters<WeightEntry>(safeData, filterConditions, getFieldType);
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error applying filters:', error);
        setFilteredData(safeData);
      }
    }
  }, [safeData, filterConditions]);

  // Use the custom hooks
  const { sortedData, handleSortClick, getSortIcon } = useTableSort(filteredData, parseDate);
  const {
    currentPage,
    totalPages,
    currentRows,
    rowsPerPage,
    totalRecords,
    indexOfFirstRow,
    indexOfLastRow,
    handlePageChange,
    handleRowsPerPageChange
    // effectiveRowsPerPage removed as it's unused
  } = useTablePagination(sortedData);

  const {
    selectedRows,
    selectAll,
    selectedCount,
    // isCurrentPageAllSelected removed as it's unused
    isSelectionMenuOpen,
    selectCheckboxRef,
    selectionMenuRef,
    handleSelectAll,
    handleSelectCurrentPage,
    handleRowSelect,
    toggleSelectionMenu,
    clearSelection
  } = useTableSelection(sortedData, currentRows);

  const {
    editingRecordId,
    editingRecord,
    handleEditClick,
    handleUpdateComplete,
    handleDeleteClick,
    handleDeleteSelected,
    cancelEditing
  } = useRecordOperations<WeightEntry>(onUpdateRecord, onDeleteRecord, onDeleteMultipleRecords);

  const { handleExportSelected } = useDataExport<WeightEntry>();

  // Field options for filter
  const fieldOptions = availableMetrics.map(metric => ({
    key: metric.key,
    name: metric.name
  }));

  // Check if we need to show actions column
  const showActions = !!onUpdateRecord || !!onDeleteRecord;

  // Check if filtered data has no records
  const hasActiveFilters = filterConditions.some(f => f.active);
  const noFilteredRecords = hasActiveFilters && filteredData.length === 0;

  // Handle exporting selected records
  const onExportSelectedHandler = async () => {
    await handleExportSelected(selectedRows, sortedData, onExportRecords);
  };

  // Handle deleting selected records
  const onDeleteSelectedHandler = async () => {
    const success = await handleDeleteSelected(selectedRows, clearSelection);
    if (success && currentPage > 1 && (filteredData.length - selectedCount) <= (currentPage - 1) * rowsPerPage) {
      handlePageChange(1);
    }
  };

  // If in edit mode, show edit form
  if (editingRecordId && editingRecord && onUpdateRecord) {
    return (
      <WeightDataForm
        onSubmit={handleUpdateComplete}
        onCancel={cancelEditing}
        initialData={editingRecord}
        recordId={editingRecordId}
        loading={loading}
        isEditMode={true}
      />
    );
  }

  // If loading, show skeleton
  if (loading) {
    return <TableSkeleton />;
  }

  // Filter metrics to show only visible columns
  const visibleMetrics = availableMetrics.filter(metric =>
    tableMetrics.includes(metric.key)
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">History</h2>

        <TableActions
          selectedCount={selectedCount}
          onExportSelected={onExportSelectedHandler}
          onDeleteSelected={onDeleteSelectedHandler}
        />
      </div>

      {/* Filter manager */}
      <FilterManager
        fieldOptions={fieldOptions}
        getFieldType={getFieldType}
        onFilterChange={setFilterConditions}
      />

      {/* Show this if we have no data after filtering */}
      {noFilteredRecords ? (
        <EmptyDataState message="No records match your filter criteria. Try adjusting your filters." />
      ) : sortedData.length === 0 ? (
        <EmptyDataState message="No data available" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <TableHeader
                visibleMetrics={visibleMetrics}
                showActions={showActions}
                handleSortClick={handleSortClick}
                getSortIcon={getSortIcon}
                selectedCount={selectedCount}
                handleSelectAll={handleSelectAll}
                toggleSelectionMenu={toggleSelectionMenu}
                isSelectionMenuOpen={isSelectionMenuOpen}
                selectionMenuRef={selectionMenuRef as React.RefObject<HTMLDivElement>} // Type assertion here
                selectCheckboxRef={selectCheckboxRef as React.RefObject<HTMLInputElement>} // Type assertion here
                selectAll={selectAll}
                handleSelectCurrentPage={handleSelectCurrentPage}
                clearSelection={clearSelection}
                totalRows={sortedData.length}
                currentRowsCount={currentRows.length}
              />
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentRows.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    row={row}
                    index={index}
                    visibleMetrics={visibleMetrics}
                    selectedRows={selectedRows}
                    handleRowSelect={handleRowSelect}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    onUpdateRecord={!!onUpdateRecord}
                    onDeleteRecord={!!onDeleteRecord}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalRecords={totalRecords}
            indexOfFirstRow={indexOfFirstRow}
            indexOfLastRow={indexOfLastRow}
            handlePageChange={handlePageChange}
            handleRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
};