import React from 'react';

interface MetricCheckboxItemProps {
  metric: {
    key: string;
    name: string;
    color: string;
  };
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  note?: string;
}

export const MetricCheckboxItem: React.FC<MetricCheckboxItemProps> = ({
  metric,
  checked,
  onToggle,
  disabled = false,
  note = '',
}) => {
  return (
    <div
      className={`flex items-center p-2 rounded-md ${
        disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <input
        type="checkbox"
        id={`table-column-${metric.key}`}
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
      />
      <div
        className="w-3 h-3 ml-2 rounded-full"
        style={{ backgroundColor: metric.color }}
      />
      <label
        htmlFor={`table-column-${metric.key}`}
        className={`ml-2 text-sm ${
          disabled
            ? 'text-gray-500 dark:text-gray-400'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {metric.name}
        {note && (
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            {note}
          </span>
        )}
      </label>
    </div>
  );
};
