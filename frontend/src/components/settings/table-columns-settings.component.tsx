import React, { useState, useEffect } from 'react';
import { useMetrics } from '@/contexts/metrics.context';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const TableColumnsSettings: React.FC = () => {
  const {
    availableMetrics,
    tableMetrics,
    setTableMetrics,
    loading
  } = useMetrics();

  const { showToast } = useToast();
  const [selectedColumns, setSelectedColumns] = useState<string[]>(tableMetrics);

  // Sync local state with context
  useEffect(() => {
    setSelectedColumns(tableMetrics);
  }, [tableMetrics]);

  const toggleColumn = (key: string) => {
    if (key === 'Date') return;

    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let columns = selectedColumns;
    if (!columns.includes('Date')) {
      columns = ['Date', ...columns];
    }

    try {
      await setTableMetrics(columns);
      showToast({
        message: 'Table columns saved successfully!',
        type: ToastType.Success,
      });
    } catch (err) {
      showToast({
        message: 'Failed to save table columns. Please try again.',
        type: ToastType.Error,
      });
    }
  };

  const selectAll = () => {
    setSelectedColumns(availableMetrics.map(m => m.key));
  };

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
              className={`flex items-center p-3 rounded-md ${
                metric.key === 'Date'
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
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
                className={`ml-2 ${
                  metric.key === 'Date'
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-700 dark:text-gray-300'
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
