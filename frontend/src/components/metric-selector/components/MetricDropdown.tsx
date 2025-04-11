// metric-selector/components/MetricDropdown.tsx
import React from 'react';
import type { MetricDropdownProps } from '../types/MetricSelector.types';
import { MetricToggle } from './MetricToggle';

export const MetricDropdown: React.FC<MetricDropdownProps> = ({
    metrics,
    selectedMetrics,
    onToggleMetric,
    onSelectAll,
    onSelectNone
}) => {
    return (
        <div
            className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="metric-menu-button"
            tabIndex={-1}
        >
            <div className="py-1" role="none">
                {metrics.map(metric => (
                    <MetricToggle
                        key={metric.key}
                        metricKey={metric.key}
                        name={metric.name}
                        isSelected={selectedMetrics.includes(metric.key)}
                        onToggle={() => onToggleMetric(metric.key)}
                    />
                ))}
            </div>

            {/* Footer with Select All / None buttons */}
            <div className="flex justify-between px-4 py-2 border-t border-gray-100">
                <button
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={onSelectAll}
                >
                    Select All
                </button>
                <button
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={onSelectNone}
                >
                    Select None
                </button>
            </div>
        </div>
    );
};