import { EditButton } from '@/components/weight/EditButton';
import { DeleteButton } from '@/components/weight/DeleteButton';
import { formatValue } from '@/utils/caclulations.utils';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

interface TableRowProps<T> {
  row: T;
  index: number;
  visibleMetrics: Array<{
    key: string;
    name: string;
    unit?: string;
  }>;
  selectedRows: Record<string, boolean>;
  handleRowSelect: (recordId: string) => void;
  handleEditClick: (recordId: string, record: T) => void;
  handleDeleteClick: (recordId: string) => void;
  onUpdateRecord?: boolean;
  onDeleteRecord?: boolean;
}

export const TableRow = <T extends Record<string, any>>({
  row,
  index,
  visibleMetrics,
  selectedRows,
  handleRowSelect,
  handleEditClick,
  handleDeleteClick,
  onUpdateRecord,
  onDeleteRecord
}: TableRowProps<T>) => {
  const recordId = row.id || `record-${index}`;
  const hasValidId = row.id && isValidObjectId(row.id);
  const isSelected = hasValidId && selectedRows[row.id as string];

  return (
    <tr
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

      {/* Actions column */}
      {(onUpdateRecord || onDeleteRecord) && (
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

      {/* Data cells */}
      {visibleMetrics.map(metric => {
        const key = metric.key as keyof T;
        const value = row[key];
        const unit = metric.unit;

        // Skip rendering if value doesn't exist
        if (value === undefined) return null;

        // Special case for Date (not a number)
        if (key === 'Date') {
          return (
            <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {value as string}
            </td>
          );
        }

        // For numeric values
        if (typeof value === 'number') {
          return (
            <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {formatValue(value)} {unit}
            </td>
          );
        }

        // Fallback for any other type
        return (
          <td key={metric.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {String(value)}
          </td>
        );
      })}
    </tr>
  );
};