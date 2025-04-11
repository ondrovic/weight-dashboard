import React from 'react';
import { useTableColumns } from './hooks/use-table-columns';
import { MetricCheckboxItem } from './components/metric-checkbox-item';
import { MetricSettingsFooter } from '../metric-settings-footer/MetricSettingsFooter';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Table Columns</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics to display in the data table.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 h-full">
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
        </div>

        <MetricSettingsFooter
          onSelectAll={selectAll}
          onSelectNone={selectNone}
          loading={loading}
          saveLabel="Save Columns"
        />
      </form>
    </div>
  );
};
