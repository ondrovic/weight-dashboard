import React from 'react';
import { useTableColumns } from './hooks/use-table-columns';
import { MetricCheckboxItem } from './components/metric-checkbox-item';

export const TableColumnsSettings: React.FC = () => {
  const {
    availableMetrics,
    selectedColumns,
    toggleColumn,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  } = useTableColumns();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Table Columns</h2>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics to display in the data table.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 grid-cols-3">
          {availableMetrics.map(metric => {
            const isDate = metric.key === 'Date';

            return (
              <MetricCheckboxItem
                key={metric.key}
                metric={{
                  key: metric.key,
                  name: metric.name,
                  color: metric.color ?? '#999999',
                }}
                checked={selectedColumns.includes(metric.key)}
                onToggle={() => toggleColumn(metric.key)}
                disabled={isDate}
                note={isDate ? '(required)' : ''}
              />
            );
          })}
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
