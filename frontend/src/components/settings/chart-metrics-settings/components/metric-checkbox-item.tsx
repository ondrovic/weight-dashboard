import React from 'react';

interface MetricCheckboxItemProps {
  metric: {
    key: string;
    name: string;
    color: string;
  };
  checked: boolean;
  onToggle: () => void;
}

export const MetricCheckboxItem: React.FC<MetricCheckboxItemProps> = ({
  metric,
  checked,
  onToggle,
}) => {
  return (
    <div
      className="flex items-center p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <input
        type="checkbox"
        id={`chart-metric-${metric.key}`}
        checked={checked}
        onChange={onToggle}
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
  );
};
