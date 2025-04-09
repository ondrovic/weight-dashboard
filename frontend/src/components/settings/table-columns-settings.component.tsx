// frontend/src/components/settings/TableColumnsSettings.tsx
import React, { useState, useEffect } from 'react';
import { useMetrics } from '@/contexts/metrics.context';

export const TableColumnsSettings: React.FC = () => {
  const {
    availableMetrics,
    tableMetrics,
    setTableMetrics,
    loading
  } = useMetrics();
  const [isSaved, setIsSaved] = useState(false);

  // Create a local state to track selections
  const [selectedColumns, setSelectedColumns] = useState<string[]>(tableMetrics);

  // Update local state when context updates
  useEffect(() => {
    setSelectedColumns(tableMetrics);
  }, [tableMetrics]);

  // Toggle a column's selection status
  const toggleColumn = (key: string) => {
    if (key === 'Date') return; // Date is always required

    setSelectedColumns(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure Date column is always included
    let columns = selectedColumns;
    if (!columns.includes('Date')) {
      columns = ['Date', ...columns];
    }

    await setTableMetrics(columns);
    setIsSaved(true);

    // Hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Handle select all
  const selectAll = () => {
    setSelectedColumns(availableMetrics.map(m => m.key));
  };

  // Handle select none (except Date)
  const selectNone = () => {
    setSelectedColumns(['Date']);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Table Columns</h2>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics to display in the data table.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 grid-cols-3">
          {availableMetrics.map(metric => (
            <div
              key={metric.key}
              className={`flex items-center p-3 rounded-md ${metric.key === 'Date' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <input
                type="checkbox"
                id={`table-column-${metric.key}`}
                checked={selectedColumns.includes(metric.key)}
                onChange={() => toggleColumn(metric.key)}
                disabled={metric.key === 'Date'}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <div
                className="w-3 h-3 ml-2 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <label
                htmlFor={`table-column-${metric.key}`}
                className={`ml-2 ${metric.key === 'Date' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                {metric.name}
                {metric.key === 'Date' && (
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(required)</span>
                )}
              </label>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={selectNone}
            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Select None
          </button>
        </div>

        {isSaved && (
          <div className="p-2 bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300 rounded">
            Table columns saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white rounded-md"
        >
          Save Columns
        </button>
      </form>
    </div>
  );
};