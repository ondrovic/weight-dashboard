// src/pages/SettingsPage.tsx
import React, { useEffect } from 'react';
import { useMetrics } from '@/contexts/Metrics';
import { useConfirmation } from '@/contexts/Confrimation';
import { ChartMetricsSettings } from '@/components/settings/chart-metrics-settings/ChartMetricsSettings';
import { WeightGoalSettings } from '@/components/settings/weight-goal-settings/WeightGoalSettings';
import { TableColumnsSettings } from '@/components/settings/table-columns-settings/TableColumnsSetting';
import { DefaultVisibleMetricsSettings } from '@/components/settings/default-visible-metrics-settings/DefaultVisibleMetricsSetting';
import { ResetSettings } from '@/components/settings/reset-settings/ResetSettings';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const SettingsPage: React.FC = () => {
  const { resetToDefaults, loading, error } = useMetrics();
  const { confirm } = useConfirmation();
  const { showToast } = useToast();

  const handleResetDefaults = async () => {
    const confirmed = await confirm({
      title: 'Reset Settings',
      message:
        'Are you sure you want to reset all settings to defaults? This will affect your table columns, chart metrics, default visible metrics, and weight goal.',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await resetToDefaults();
        showToast({
          message: 'All settings have been reset to their default values.',
          type: ToastType.Success,
        });
      } catch (err) {
        showToast({
          message: 'Failed to reset settings. Please try again.',
          type: ToastType.Error,
        });
      }
    }
  };

  useEffect(() => {
    if (error) {
      showToast({ message: error, type: ToastType.Error });
    }
  }, [error]);

  return (
    // Using w-full instead of container to maximize available space
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Customize your weight tracking experience by adjusting these settings.
        </p>
      </div>

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
