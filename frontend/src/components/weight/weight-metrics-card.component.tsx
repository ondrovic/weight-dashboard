// frontend/src/components/weight/WeightMetricsCard.tsx
import React from 'react';
import { WeightStats } from '../../types/weight-data.types';
import {
  calculateTotalWeightChange,
  calculateDaysBetween,
  calculateDailyRate,
  calculateCaloricBalance,
  formatValue
} from '../../utils/caclulations.utils';

interface WeightMetricsCardProps {
  stats: WeightStats | null;
  loading: boolean;
  goalWeight?: number; // Optional goal weight
}

// Progress bar component
const ProgressBar: React.FC<{
  current: number;
  start: number;
  goal: number;
  label: string;
}> = ({ current, start, goal, label }) => {
  // Calculate percentage progress towards goal
  const range = Math.abs(start - goal);
  const progress = Math.abs(start - current);
  const percentage = range > 0 ? (progress / range) * 100 : 0;

  // Determine if the progress direction is correct
  // If start > goal (losing weight) then current should decrease
  // If start < goal (gaining weight) then current should increase
  const isCorrectDirection =
    (start > goal && current < start) ||
    (start < goal && current > start);

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span>{formatValue(percentage)}% complete</span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isCorrectDirection ? 'bg-green-500 dark:bg-green-600' : 'bg-yellow-500 dark:bg-yellow-600'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>
    </div>
  );
};

export const WeightMetricsCard: React.FC<WeightMetricsCardProps> = ({
  stats,
  loading,
  goalWeight
}) => {
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Progress</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Calculate metrics
  const { change, percentChange, isLoss } = calculateTotalWeightChange(stats);
  const days = calculateDaysBetween(stats.oldest.Date, stats.latest.Date);
  const dailyRate = calculateDailyRate(
    stats.oldest.Weight,
    stats.latest.Weight,
    stats.oldest.Date,
    stats.latest.Date
  );
  const caloricBalance = calculateCaloricBalance(change, days);

  // Calculate body composition changes
  const fatMassChange =
    (stats.latest.Weight * stats.latest["Body Fat %"] / 100) -
    (stats.oldest.Weight * stats.oldest["Body Fat %"] / 100);

  const muscleMassChange = stats.latest["Muscle Mass"] - stats.oldest["Muscle Mass"];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Progress</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight changes */}
        <div className="space-y-3">
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Total Changes</h3>
            <p className={`text-xl font-semibold ${isLoss ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isLoss ? '-' : '+'}{Math.abs(change).toFixed(1)} lbs ({formatValue(percentChange, 1)}%)
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Over {days} days</p>
          </div>

          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Daily Average</h3>
            <p className={`text-lg font-semibold ${dailyRate < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {dailyRate > 0 ? '+' : ''}{formatValue(dailyRate, 2)} lbs/day
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Est. {Math.abs(caloricBalance).toFixed(0)} calories {caloricBalance < 0 ? 'deficit' : 'surplus'}/day
            </p>
          </div>
        </div>

        {/* Body composition changes */}
        <div className="space-y-3">
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Body Composition</h3>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fat Mass</p>
                <p className={`text-lg font-semibold ${fatMassChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {fatMassChange > 0 ? '+' : ''}{formatValue(fatMassChange, 1)} lbs
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Muscle Mass</p>
                <p className={`text-lg font-semibold ${muscleMassChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {muscleMassChange > 0 ? '+' : ''}{formatValue(muscleMassChange, 1)} lbs
                </p>
              </div>
            </div>
          </div>

          {/* Body fat percentage change */}
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Body Fat %</h3>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {formatValue(stats.oldest["Body Fat %"])}% → {formatValue(stats.latest["Body Fat %"])}%
              </p>
              <p className={`text-sm font-medium ${stats.latest["Body Fat %"] < stats.oldest["Body Fat %"]
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                {formatValue(stats.latest["Body Fat %"] - stats.oldest["Body Fat %"], 1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal progress section */}
      {goalWeight && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">Goal Progress</h3>

          <ProgressBar
            current={stats.latest.Weight}
            start={stats.oldest.Weight}
            goal={goalWeight}
            label={`${stats.oldest.Weight.toFixed(0)} lbs → ${goalWeight.toFixed(0)} lbs`}
          />

          {dailyRate !== 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {dailyRate < 0 && stats.latest.Weight > goalWeight && (
                  <>Estimated {Math.ceil(Math.abs((stats.latest.Weight - goalWeight) / dailyRate))} days remaining at current rate</>
                )}
                {dailyRate > 0 && stats.latest.Weight < goalWeight && (
                  <>Estimated {Math.ceil(Math.abs((goalWeight - stats.latest.Weight) / dailyRate))} days remaining at current rate</>
                )}
                {((dailyRate < 0 && stats.latest.Weight < goalWeight) ||
                  (dailyRate > 0 && stats.latest.Weight > goalWeight)) && (
                    <>Current trend is moving away from goal</>
                  )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};