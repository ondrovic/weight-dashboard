// metric-selector/types/MetricSelector.types.ts
export interface Metric {
    key: string;
    name: string;
    color?: string;
    unit?: string;
}

export interface MetricSelectorProps {
    metrics: Metric[];
    selectedMetrics: string[];
    onChange: (selectedKeys: string[]) => void;
    buttonText?: string;
}

export interface MetricSelectorButtonProps {
    buttonText: string;
    isOpen: boolean;
    onClick: () => void;
}

export interface MetricDropdownProps {
    metrics: Metric[];
    selectedMetrics: string[];
    onToggleMetric: (metricKey: string) => void;
    onSelectAll: () => void;
    onSelectNone: () => void;
}

export interface MetricToggleProps {
    metricKey: string;
    name: string;
    isSelected: boolean;
    onToggle: () => void;
}

export interface MetricSelectorHookProps {
    selectedMetrics: string[];
    onChange: (selectedKeys: string[]) => void;
}

export interface MetricSelectorHookReturn {
    isOpen: boolean;
    toggleDropdown: () => void;
    handleMetricToggle: (metricKey: string) => void;
    handleSelectAll: (metrics: Metric[]) => void;
    handleSelectNone: () => void;
}