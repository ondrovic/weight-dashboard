// metric-selector/hooks/useMetricSelector.ts
import { useState } from 'react';
import type { Metric, MetricSelectorHookProps, MetricSelectorHookReturn } from '../types/MetricSelector.types';

export const useMetricSelector = ({
    selectedMetrics,
    onChange
}: MetricSelectorHookProps): MetricSelectorHookReturn => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleMetricToggle = (metricKey: string) => {
        const newSelection = selectedMetrics.includes(metricKey)
            ? selectedMetrics.filter(key => key !== metricKey)
            : [...selectedMetrics, metricKey];

        onChange(newSelection);
    };

    const handleSelectAll = (metrics: Metric[]) => {
        onChange(metrics.map(m => m.key));
    };

    const handleSelectNone = () => {
        onChange([]);
    };

    return {
        isOpen,
        toggleDropdown,
        handleMetricToggle,
        handleSelectAll,
        handleSelectNone
    };
};