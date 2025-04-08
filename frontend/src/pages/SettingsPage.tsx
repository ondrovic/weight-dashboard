// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { useMetrics } from '../contexts/MetricsContext';
import { useConfirmation } from '../contexts/ConfirmationContext';
import { WeightGoalSettings } from '../components/settings/WeightGoalSettings';
import { TableColumnsSettings } from '../components/settings/TableColumnsSettings';
import { ChartMetricsSettings } from '../components/settings/ChartMetricsSettings';
import { DefaultVisibleMetricsSettings } from '../components/settings/DefaultVisibleMetricsSettings';
import ResetSettings from '../components/settings/ResetSettings';
const SettingsPage: React.FC = () => {
  const { resetToDefaults, loading, error } = useMetrics();
  const { confirm } = useConfirmation();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDefaults = async () => {
    // Use the confirmation service instead of window.confirm
    const confirmed = await confirm({
      title: 'Reset Settings',
      message: 'Are you sure you want to reset all settings to defaults? This will affect your table columns, chart metrics, default visible metrics, and weight goal.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
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

      {/* Weight Goal at the top */}
      <div className="mb-4">
        <WeightGoalSettings />
      </div>

      {/* Three settings in a row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Default Visible Metrics */}
        <DefaultVisibleMetricsSettings />

        {/* Table Columns Settings */}
        <TableColumnsSettings />

        {/* Chart Metrics Settings */}
        <ChartMetricsSettings />
      </div>

      {/* Reset All Settings Button */}
      <ResetSettings onReset={handleResetDefaults} loading={loading} />

    </div>
  );
};

export default SettingsPage;