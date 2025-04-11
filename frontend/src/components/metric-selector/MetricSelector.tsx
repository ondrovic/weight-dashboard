// metric-selector/MetricSelector.tsx
import React from 'react';
import { useMetricSelector } from './hooks/useMetricSelector';
import { MetricSelectorButton } from './components/MetricSelectorButton';
import { MetricDropdown } from './components/MetricDropdown';
import type { MetricSelectorProps } from './types/MetricSelector.types';

// export { Metric } from './types/MetricSelector.types';

export const MetricSelector: React.FC<MetricSelectorProps> = ({
    metrics,
    selectedMetrics,
    onChange,
    buttonText = 'Metrics'
}) => {
    const { isOpen, toggleDropdown, handleMetricToggle, handleSelectAll, handleSelectNone } =
        useMetricSelector({ selectedMetrics, onChange });

    return (
        <div className="relative inline-block text-left">
            <MetricSelectorButton
                buttonText={buttonText}
                isOpen={isOpen}
                onClick={toggleDropdown}
            />

            {isOpen && (
                <MetricDropdown
                    metrics={metrics}
                    selectedMetrics={selectedMetrics}
                    onToggleMetric={handleMetricToggle}
                    onSelectAll={() => handleSelectAll(metrics)}
                    onSelectNone={handleSelectNone}
                />
            )}
        </div>
    );
};