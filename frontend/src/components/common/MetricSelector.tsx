// frontend/src/components/common/MetricSelector.tsx
import React, { useState } from 'react';

// Define the metric type
export interface Metric {
  key: string;
  name: string;
  color?: string;
  unit?: string;
}

interface MetricSelectorProps {
  metrics: Metric[];
  selectedMetrics: string[];
  onChange: (selectedKeys: string[]) => void;
  buttonText?: string;
}

export const MetricSelector: React.FC<MetricSelectorProps> = ({
  metrics,
  selectedMetrics,
  onChange,
  buttonText = 'Metrics'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMetric = (metricKey: string) => {
    const newSelection = selectedMetrics.includes(metricKey)
      ? selectedMetrics.filter(key => key !== metricKey)
      : [...selectedMetrics, metricKey];
    onChange(newSelection);
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id="metric-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {buttonText}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="metric-menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {metrics.map(metric => (
              <div key={metric.key} className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50">
                <label htmlFor={`toggle-${metric.key}`} className="block text-sm text-gray-900 cursor-pointer">
                  {metric.name}
                </label>
                
                {/* Toggle Switch */}
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id={`toggle-${metric.key}`}
                    className="sr-only"
                    checked={selectedMetrics.includes(metric.key)}
                    onChange={() => toggleMetric(metric.key)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                    selectedMetrics.includes(metric.key) ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}></div>
                  <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                    selectedMetrics.includes(metric.key) ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer with Select All / None buttons */}
          <div className="flex justify-between px-4 py-2 border-t border-gray-100">
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800"
              onClick={() => onChange(metrics.map(m => m.key))}
            >
              Select All
            </button>
            <button
              className="text-xs text-indigo-600 hover:text-indigo-800"
              onClick={() => onChange([])}
            >
              Select None
            </button>
          </div>
        </div>
      )}
    </div>
  );
};