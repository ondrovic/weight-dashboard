// metric-selector/components/MetricToggle.tsx
import React from 'react';
import type { MetricToggleProps } from '../types/MetricSelector.types';

export const MetricToggle: React.FC<MetricToggleProps> = ({
    metricKey,
    name,
    isSelected,
    onToggle
}) => {
    return (
        <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50">
            <label htmlFor={`toggle-${metricKey}`} className="block text-sm text-gray-900 cursor-pointer">
                {name}
            </label>

            <div className="relative inline-block w-10 align-middle select-none">
                <input
                    type="checkbox"
                    id={`toggle-${metricKey}`}
                    className="sr-only"
                    checked={isSelected}
                    onChange={onToggle}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${isSelected ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}></div>
                <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${isSelected ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
            </div>
        </div>
    );
};