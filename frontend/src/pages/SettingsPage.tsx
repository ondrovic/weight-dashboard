// frontend/src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { DarkModeToggle } from '../components/settings/DarkModeToggle';
import { WeightGoalSettings } from '../components/settings/WeightGoalSettings';
import { TableColumnsSettings } from '../components/settings/TableColumnsSettings';
import { ChartMetricsSettings } from '../components/settings/ChartMetricsSettings';

const SettingsPage: React.FC = () => {
  const { resetToDefaults, loading, error } = useMetrics();
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const handleResetDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      await resetToDefaults();
      setResetSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    // Using w-full instead of container to maximize available space
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Customize your weight tracking experience by adjusting these settings.
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Success message for reset */}
      {resetSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>All settings have been reset to their default values.</p>
        </div>
      )}
      
      {/* Reduced gap and margin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Dark Mode Toggle */}
        <DarkModeToggle />
        
        {/* Weight Goal Settings */}
        <WeightGoalSettings />
      </div>
      
      <div className="mb-4">
        {/* Table Columns Settings */}
        <TableColumnsSettings />
      </div>
      
      <div className="mb-4">
        {/* Chart Metrics Settings */}
        <ChartMetricsSettings />
      </div>
      
      {/* Reset All Settings Button */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Reset Settings</h2>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Reset all settings to their default values. This will affect your table columns, 
          chart metrics, and weight goal.
        </p>
        
        <button
          onClick={handleResetDefaults}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading 
              ? 'bg-gray-400 dark:bg-gray-600' 
              : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
          }`}
        >
          {loading ? 'Resetting...' : 'Reset All Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;