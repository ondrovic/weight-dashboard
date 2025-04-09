// frontend/src/components/weight/StatsCard.tsx
import React from 'react';
import { WeightStats } from '../../types/weight-data.types';

interface StatsCardProps {
  stats: WeightStats | null;
  loading: boolean;
}

// Helper function to format values with proper decimal places
const formatValue = (value: number, decimalPlaces: number = 1): string => {
  return value.toFixed(decimalPlaces);
};

// Reusable stat display component
const StatItem: React.FC<{
  label: string;
  value: number | string;
  suffix?: string;
  size?: 'small' | 'large';
}> = ({ label, value, suffix = '', size = 'small' }) => {
  const valueClass = size === 'large'
    ? 'text-3xl font-bold text-blue-600 dark:text-blue-400'
    : 'text-lg font-semibold';

  return (
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className={valueClass}>
        {value}{suffix && ` ${suffix}`}
      </p>
    </div>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse transition-colors duration-200">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md justify-center items-center flex flex-col h-full transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Extract the stats we need
  const { latest, oldest, count, stats: statDetails } = stats;
  const weightStats = statDetails.Weight;

  // Calculate weight change
  const weightChange = latest.Weight - oldest.Weight;
  const weightChangePercent = (weightChange / oldest.Weight) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Weight Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Current Weight</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatValue(latest.Weight)} lbs
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Date: {latest.Date}
          </p>

          <div className="mt-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Change</p>
            <p className={`text-lg font-semibold ${weightChange < 0 ? 'text-green-600 dark:text-green-400' : weightChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {weightChange > 0 ? '+' : ''}{formatValue(weightChange)} lbs ({formatValue(weightChangePercent, 2)}%)
            </p>
          </div>
        </div>

        {/* Weight Statistics Overview */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Overview</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatItem label="Average" value={formatValue(weightStats.avg)} suffix="lbs" />
            <StatItem label="Min" value={formatValue(weightStats.min)} suffix="lbs" />
            <StatItem label="Max" value={formatValue(weightStats.max)} suffix="lbs" />
            <StatItem label="Records" value={count} />
          </div>
        </div>
      </div>

      {/* Additional Metrics Section */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">Body Composition</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatItem
            label="Body Fat %"
            value={formatValue(latest["Body Fat %"])}
            suffix="%"
          />
          <StatItem
            label="BMI"
            value={formatValue(latest.BMI)}
          />
          <StatItem
            label="Water %"
            value={formatValue(latest["Water %"])}
            suffix="%"
          />
          <StatItem
            label="Muscle Mass"
            value={formatValue(latest["Muscle Mass"])}
            suffix="lbs"
          />
          <StatItem
            label="Visceral Fat"
            value={formatValue(latest["V-Fat"])}
          />
          <StatItem
            label="Subcutaneous Fat"
            value={formatValue(latest["S-Fat"])}
            suffix="%"
          />
          <StatItem
            label="BMR"
            value={formatValue(latest.BMR, 0)}
            suffix="kcal"
          />
          <StatItem
            label="Heart Rate"
            value={formatValue(latest.HR, 0)}
            suffix="bpm"
          />
        </div>
      </div>
    </div>
  );
};