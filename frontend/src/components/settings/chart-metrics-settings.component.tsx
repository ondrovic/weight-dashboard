import React, { useState, useEffect } from 'react';
import { useMetrics } from '@/contexts/metrics.context';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const ChartMetricsSettings: React.FC = () => {
  const {
    availableMetrics,
    chartMetrics,
    setChartMetrics,
    loading
  } = useMetrics();

  const { showToast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(chartMetrics);

  useEffect(() => {
    setSelectedMetrics(chartMetrics);
  }, [chartMetrics]);

  const toggleMetric = (key: string) => {
    if (key === 'Date') return;

    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const metrics = selectedMetrics.filter(key => key !== 'Date');

    try {
      await setChartMetrics(metrics);
      showToast({
        message: 'Chart metrics saved successfully!',
        type: ToastType.Success,
      });
    } catch {
      showToast({
        message: 'Failed to save chart metrics.',
        type: ToastType.Error,
      });
    }
  };

  const selectAll = () => {
    setSelectedMetrics(availableMetrics.filter(m => m.key !== 'Date').map(m => m.key));
  };

  const selectNone = () => {
    setSelectedMetrics([]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 h-full">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Chart Metrics</h2>

      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Select which metrics to display in the weight chart.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 grid-cols-3">
          {availableMetrics
            .filter(metric => metric.key !== 'Date')
            .map(metric => (
              <div
                key={metric.key}
                className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  id={`chart-metric-${metric.key}`}
                  checked={selectedMetrics.includes(metric.key)}
                  onChange={() => toggleMetric(metric.key)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <div
                  className="w-3 h-3 ml-2 rounded-full"
                  style={{ backgroundColor: metric.color }}
                />
                <label
                  htmlFor={`chart-metric-${metric.key}`}
                  className="ml-2 text-gray-700 dark:text-gray-300"
                >
                  {metric.name}
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
          Save Metrics
        </button>
      </form>
    </div>
  );
};
