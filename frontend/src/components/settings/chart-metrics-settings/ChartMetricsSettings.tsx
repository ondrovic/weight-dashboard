import React from 'react';
import { useChartMetrics } from './hooks/use-chart-metrics';
import { MetricCheckboxItem } from './components/metric-checkbox-item';

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
                            <MetricCheckboxItem
                                key={metric.key}
                                metric={{
                                    key: metric.key,
                                    name: metric.name,
                                    color: metric.color ?? '#999999', // fallback here ✅
                                }}
                                checked={selectedMetrics.includes(metric.key)}
                                onToggle={() => toggleMetric(metric.key)}
                            />
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
