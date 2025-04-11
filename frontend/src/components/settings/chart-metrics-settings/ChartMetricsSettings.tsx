import React from 'react';
import { useChartMetrics } from './hooks/use-chart-metrics';
import { MetricCheckboxItem } from './components/metric-checkbox-item';
import { MetricSettingsFooter } from '../metric-settings-footer/MetricSettingsFooter';

export const ChartMetricsSettings: React.FC = () => {
  const {
    availableMetrics,
    selectedMetrics,
    toggleMetric,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  } = useChartMetrics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Chart Metrics</h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics to display in the weight chart.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 h-full">
            {availableMetrics
              .filter(metric => metric.key !== 'Date')
              .map(metric => (
                <MetricCheckboxItem
                  key={metric.key}
                  metric={{
                    key: metric.key,
                    name: metric.name,
                    color: metric.color ?? '#999999',
                  }}
                  checked={selectedMetrics.includes(metric.key)}
                  onToggle={() => toggleMetric(metric.key)}
                />
              ))}
          </div>
        </div>

        <MetricSettingsFooter
          onSelectAll={selectAll}
          onSelectNone={selectNone}
          loading={loading}
          saveLabel="Save Chart Metrics"
        />
      </form>
    </div>
  );
};
