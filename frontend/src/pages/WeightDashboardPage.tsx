// frontend/src/pages/WeightDashboardPage.tsx
import React from 'react';
import { useWeightData } from '../hooks/useWeightData';
import { WeightChart } from '../components/weight/WeightChart';
import { StatsCard } from '../components/weight/StatsCard';
import { WeightMetricsCard } from '../components/weight/WeightMetricsCard';
import { useMetrics } from '../contexts/MetricsContext';

const WeightDashboardPage: React.FC = () => {
  const { 
    data, 
    stats, 
    loading: dataLoading, 
    error: dataError,
    refreshData 
  } = useWeightData();
  
  // Get goal weight from metrics context
  const { goalWeight, error: settingsError } = useMetrics();

  // Convert the goalWeight from number | null to number | undefined
  // This resolves the TypeScript error by ensuring proper type compatibility
  const convertedGoalWeight = goalWeight === null ? undefined : goalWeight;

  // Combine errors
  const error = dataError || settingsError;

  return (
    // Using w-full instead of container to maximize available space
    <div className="w-full">
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          {dataError && (
            <button
              onClick={refreshData}
              className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            >
              Try Again
            </button>
          )}
        </div>
      )}
      
      {/* Stats cards row - reduced gap and margin bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <StatsCard stats={stats} loading={dataLoading} />
        <WeightMetricsCard stats={stats} loading={dataLoading} goalWeight={convertedGoalWeight} />
      </div>

      {/* Weight chart - reduced margin bottom */}
      <div className="mb-4">
        <WeightChart data={data} goal={convertedGoalWeight} height={400} />
      </div>

      {/* Additional information */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About This Dashboard</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This dashboard displays your weight tracking data over time. The stats cards show a summary of your
          current weight metrics, while the chart visualizes your progress. You can toggle different metrics
          in the chart to focus on specific aspects of your health journey.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          To add new data, navigate to the Data Entry page using the sidebar or quick actions. There you can
          manually enter new measurements or upload a CSV file from your smart scale.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Your display preferences and goal weight are automatically saved to your account and will persist across devices.
        </p>
      </div>
    </div>
  );
};

export default WeightDashboardPage;