import React from 'react';
import { useDefaultVisibleMetrics } from './hooks/use-default-visible-metrics';
import { MetricCheckboxItem } from './components/metric-checkbox-item';

export const DefaultVisibleMetricsSettings: React.FC = () => {
  const {
    availableMetrics,
    chartMetrics,
    selectedMetrics,
    toggleMetric,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  } = useDefaultVisibleMetrics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full flex flex-col">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Default Visible Metrics</h2>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics should be visible by default in the weight chart.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="grid grid-cols-3 gap-4 mb-auto">
          {availableMetrics
            .filter(metric => metric.key !== 'Date')
            .map(metric => {
              const isEnabled = chartMetrics.includes(metric.key);

              return (
                <MetricCheckboxItem
                  key={metric.key}
                  metric={{
                    key: metric.key,
                    name: metric.name,
                    color: metric.color ?? '#999999',
                  }}
                  checked={selectedMetrics.includes(metric.key)}
                  onToggle={() => toggleMetric(metric.key)}
                  disabled={!isEnabled}
                  note={!isEnabled ? '(not in chart)' : ''}
                />
              );
            })}
        </div>

        <div className="mt-auto">
          <div className="flex space-x-4 mb-4">
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
            Save Default Visibility
          </button>
        </div>
      </form>
    </div>
  );
};
