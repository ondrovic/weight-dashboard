// src/components/settings/DefaultVisibleMetricsSettings.tsx
import React, { useState, useEffect } from 'react';
import { useMetrics } from '../../contexts/metrics.context';

export const DefaultVisibleMetricsSettings: React.FC = () => {
  const {
    availableMetrics,
    chartMetrics,
    defaultVisibleMetrics,
    setDefaultVisibleMetrics,
    loading
  } = useMetrics();

  const [isSaved, setIsSaved] = useState(false);

  // Create a local state to track selections
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultVisibleMetrics);

  // Update local state when context updates
  useEffect(() => {
    setSelectedMetrics(defaultVisibleMetrics);
  }, [defaultVisibleMetrics]);

  // Toggle a metric's selection status
  const toggleMetric = (key: string) => {
    // Skip Date for chart metrics
    if (key === 'Date') return;

    // Can only select metrics that are enabled in chartMetrics
    if (!chartMetrics.includes(key)) return;

    setSelectedMetrics(prev => {
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

    // Remove Date from chart metrics (not needed for charts)
    const metrics = selectedMetrics.filter(key => key !== 'Date');

    await setDefaultVisibleMetrics(metrics);
    setIsSaved(true);

    // Hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Handle select all
  const selectAll = () => {
    setSelectedMetrics(chartMetrics.filter(key => key !== 'Date'));
  };

  // Handle select none
  const selectNone = () => {
    setSelectedMetrics([]);
  };

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
                <div
                  key={metric.key}
                  className={`flex items-center p-2 rounded-md ${isEnabled
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                  <input
                    type="checkbox"
                    id={`default-visible-${metric.key}`}
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={() => toggleMetric(metric.key)}
                    disabled={!isEnabled}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div
                    className="w-3 h-3 ml-2 rounded-full"
                    style={{ backgroundColor: metric.color }}
                  />
                  <label
                    htmlFor={`default-visible-${metric.key}`}
                    className={`ml-2 text-gray-700 dark:text-gray-300 text-sm ${!isEnabled ? 'text-gray-400 dark:text-gray-500' : ''
                      }`}
                  >
                    {metric.name}
                    {!isEnabled && (
                      <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                        (not in chart)
                      </span>
                    )}
                  </label>
                </div>
              );
            })
          }
        </div>

        {isSaved && (
          <div className="p-2 bg-green-50 text-green-700 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300 rounded mb-4">
            Default visible metrics saved successfully!
          </div>
        )}

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