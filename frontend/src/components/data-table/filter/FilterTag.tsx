// Component for displaying an active filter as a tag

import React from 'react';
import { FilterCondition } from './types/Filter';
import { getOperatorDisplay, formatFilterValue } from './utils/Filter';

interface FilterTagProps {
    filter: FilterCondition;
    fieldName: string;
    onToggleActive: (id: string) => void;
    onRemove: (id: string) => void;
}

export const FilterTag: React.FC<FilterTagProps> = ({
    filter,
    fieldName,
    onToggleActive,
    onRemove
}) => {
    return (
        <div
            className={`filter-tag px-2 py-1 text-xs rounded flex items-center ${filter.active
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
        >
            <span className="font-medium mr-1">{fieldName}:</span>
            <span>{getOperatorDisplay(filter.operator)}</span>
            <span className="ml-1 font-medium">{formatFilterValue(filter.value)}</span>

            <button
                onClick={() => onToggleActive(filter.id)}
                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title={filter.active ? 'Disable filter' : 'Enable filter'}
            >
                {filter.active ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                )}
            </button>

            <button
                onClick={() => onRemove(filter.id)}
                className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                title="Remove filter"
            >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};