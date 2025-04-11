// metric-selector/components/MetricSelectorButton.tsx
import React from 'react';
import type { MetricSelectorButtonProps } from '../types/MetricSelector.types';
import { ChevronIcon } from './ChevronIcon';

export const MetricSelectorButton: React.FC<MetricSelectorButtonProps> = ({
    buttonText,
    isOpen,
    onClick
}) => {
    return (
        <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="metric-menu-button"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={onClick}
        >
            {buttonText}
            <ChevronIcon />
        </button>
    );
};