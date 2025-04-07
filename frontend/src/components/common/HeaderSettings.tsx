// frontend/src/components/common/HeaderSettings.tsx
import React, { useState } from 'react';
import { useMetrics } from '../../contexts/MetricsContext';

export const HeaderSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'table' | 'chart' | 'goal' | 'appearance'>('table');
  const { 
    availableMetrics, 
    tableMetrics, 
    chartMetrics, 
    goalWeight,
    darkMode,
    setTableMetrics, 
    setChartMetrics, 
    setGoalWeight,
    setDarkMode,
    resetToDefaults,
    loading
  } = useMetrics();

  // Toggle a table metric
  const toggleTableMetric = (metricKey: string) => {
    // Don't allow Date to be deselected for table
    if (metricKey === 'Date') return;
    
    if (tableMetrics.includes(metricKey)) {
      setTableMetrics(tableMetrics.filter(k => k !== metricKey));
    } else {
      setTableMetrics([...tableMetrics, metricKey]);
    }
  };

  // Toggle a chart metric
  const toggleChartMetric = (metricKey: string) => {
    if (chartMetrics.includes(metricKey)) {
      setChartMetrics(chartMetrics.filter(k => k !== metricKey));
    } else {
      setChartMetrics([...chartMetrics, metricKey]);
    }
  };

  // Handle goal weight change
  const handleGoalWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value ? parseFloat(value) : null;
    setGoalWeight(numValue);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Handle reset button click
  const handleReset = () => {
    if (window.confirm('Reset all settings to default values?')) {
      resetToDefaults();
    }
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        title="Settings"
        disabled={loading}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
          />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Display Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure what metrics to display</p>
            </div>
            
            {/* Tab Selector */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button
                className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                  currentTab === 'table' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setCurrentTab('table')}
              >
                Table Columns
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                  currentTab === 'chart' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setCurrentTab('chart')}
              >
                Chart Metrics
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                  currentTab === 'goal' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setCurrentTab('goal')}
              >
                Goal
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                  currentTab === 'appearance' 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setCurrentTab('appearance')}
              >
                Appearance
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="max-h-80 overflow-y-auto">
              {currentTab === 'table' && (
                <div className="py-2">
                  {availableMetrics.map(metric => (
                    <div 
                      key={metric.key} 
                      className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => metric.key !== 'Date' && toggleTableMetric(metric.key)}
                    >
                      <label 
                        className={`block text-sm text-gray-900 dark:text-gray-200 ${metric.key !== 'Date' ? 'cursor-pointer' : ''}`}
                      >
                        {metric.name}
                        {metric.key === 'Date' && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(required)</span>
                        )}
                      </label>
                      
                      {/* Toggle Switch */}
                      <div 
                        className={`relative inline-block w-10 h-6 ${metric.key !== 'Date' ? 'cursor-pointer' : ''}`}
                      >
                        <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          tableMetrics.includes(metric.key) ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                        <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                          tableMetrics.includes(metric.key) ? 'translate-x-4' : 'translate-x-0'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {currentTab === 'chart' && (
                <div className="py-2">
                  {availableMetrics
                    // Filter out Date from chart metrics
                    .filter(metric => metric.key !== 'Date')
                    .map(metric => (
                      <div 
                        key={metric.key} 
                        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => toggleChartMetric(metric.key)}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: metric.color }}
                          ></div>
                          <label className="block text-sm text-gray-900 dark:text-gray-200 cursor-pointer">
                            {metric.name}
                          </label>
                        </div>
                        
                        {/* Toggle Switch */}
                        <div className="relative inline-block w-10 h-6 cursor-pointer">
                          <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                            chartMetrics.includes(metric.key) ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}></div>
                          <div className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                            chartMetrics.includes(metric.key) ? 'translate-x-4' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              
              {currentTab === 'goal' && (
                <div className="py-2 px-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Weight (lbs)
                  </label>
                  <input
                    type="number"
                    value={goalWeight || ''}
                    onChange={handleGoalWeightChange}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    placeholder="Enter your goal weight"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Set your target weight goal. This will be displayed on your weight chart.
                  </p>
                </div>
              )}

              {currentTab === 'appearance' && (
                <div className="py-2 px-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dark Mode
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={handleDarkModeToggle}
                      className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                      role="switch"
                      aria-checked={darkMode}
                    >
                      <span 
                        aria-hidden="true" 
                        className={`${darkMode ? 'translate-x-5 bg-indigo-600' : 'translate-x-0 bg-gray-200 dark:bg-gray-700'} 
                                    pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      ></span>
                    </button>
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {darkMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Toggle between light and dark mode for the application.
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer with buttons */}
            <div className="flex justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-700">
              {currentTab !== 'goal' && currentTab !== 'appearance' ? (
                <>
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    onClick={() => {
                      if (currentTab === 'table') {
                        setTableMetrics(availableMetrics.map(m => m.key));
                      } else if (currentTab === 'chart') {
                        setChartMetrics(availableMetrics.filter(m => m.key !== 'Date').map(m => m.key));
                      }
                    }}
                  >
                    Select All
                  </button>
                  <button
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    onClick={() => {
                      if (currentTab === 'table') {
                        // Keep Date for table
                        setTableMetrics(['Date']);
                      } else if (currentTab === 'chart') {
                        setChartMetrics([]);
                      }
                    }}
                  >
                    Select None
                  </button>
                </>
              ) : (
                <div className="w-full flex justify-center">
                  <button
                    className="text-xs bg-indigo-600 dark:bg-indigo-500 text-white py-1 px-3 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600"
                    onClick={handleReset}
                  >
                    Reset All Settings to Defaults
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};