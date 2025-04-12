// frontend/src/components/weight/WeightMetricsCard.tsx
import React, { useMemo } from 'react';
import { WeightStats, WeightEntry, createEmptyWeightStats } from '@/types/weight-data.types';
import {
  calculateDaysBetween,
  calculateDailyRate,
  calculateCaloricBalance,
  formatValue
} from '@/utils/caclulations.utils';

interface WeightMetricsCardProps {
  stats: WeightStats | null;
  loading: boolean;
  goalWeight?: number;
  filteredData?: WeightEntry[] | null;
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
  goalWeight,
  filteredData
}) => {
  // Calculate filtered stats if we have filtered data
  const filteredStats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return null;
    }
    
    // Sort by date to get oldest and latest
    const sortedData = [...filteredData].sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const [month, day, year] = dateStr.split('-');
        return new Date(`20${year}-${month}-${day}`).getTime();
      };
      
      return parseDate(a.Date) - parseDate(b.Date);
    });
    
    const oldest = sortedData[0];
    const latest = sortedData[sortedData.length - 1];
    
    // Return stats object
    return {
      latest,
      oldest,
      count: sortedData.length
    };
  }, [filteredData]);

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

  // Use filteredStats if available, otherwise use the original stats
  const effectiveStats = filteredStats || stats;

  if (!effectiveStats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Progress</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Use safe defaults with empty stats
  const safeStats = effectiveStats || createEmptyWeightStats();
  const latest = safeStats.latest || {} as WeightEntry;
  const oldest = safeStats.oldest || {} as WeightEntry;

  // Safe access to dates
  const latestDate = latest.Date || '';
  const oldestDate = oldest.Date || '';
  
  // Calculate metrics safely
  const totalWeightChange = latest.Weight !== undefined && oldest.Weight !== undefined 
    ? latest.Weight - oldest.Weight 
    : 0;
  
  const percentWeightChange = oldest.Weight && totalWeightChange
    ? (totalWeightChange / oldest.Weight) * 100
    : 0;
    
  const isLoss = totalWeightChange < 0;
  
  // Only calculate if we have valid dates
  const days = (latestDate && oldestDate) 
    ? calculateDaysBetween(oldestDate, latestDate)
    : 0;
    
  const dailyRate = (latestDate && oldestDate && latest.Weight !== undefined && oldest.Weight !== undefined) 
    ? calculateDailyRate(
        oldest.Weight,
        latest.Weight,
        oldestDate,
        latestDate
      )
    : 0;
    
  const caloricBalance = calculateCaloricBalance(totalWeightChange, days);

  // Calculate body composition changes safely
  const latestWeight = latest.Weight || 0;
  const latestBodyFat = latest["Body Fat %"] || 0;
  const oldestWeight = oldest.Weight || 0;
  const oldestBodyFat = oldest["Body Fat %"] || 0;
  
  const fatMassChange = 
    (latestWeight * latestBodyFat / 100) -
    (oldestWeight * oldestBodyFat / 100);

  const latestMuscleMass = latest["Muscle Mass"] || 0;
  const oldestMuscleMass = oldest["Muscle Mass"] || 0;
  const muscleMassChange = latestMuscleMass - oldestMuscleMass;

  // Date range info for display
  const dateRangeInfo = filteredData && stats && filteredData.length > 0 && filteredData.length !== stats.count
    ? `Showing ${filteredData.length} of ${stats.count} records`
    : '';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Progress</h2>
        {dateRangeInfo && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{dateRangeInfo}</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weight changes */}
        <div className="space-y-3">
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">Total Changes</h3>
            <p className={`text-xl font-semibold ${isLoss ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isLoss ? '-' : '+'}{Math.abs(totalWeightChange).toFixed(1)} lbs ({formatValue(percentWeightChange, 1)}%)
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
                {formatValue(oldestBodyFat)}% → {formatValue(latestBodyFat)}%
              </p>
              <p className={`text-sm font-medium ${latestBodyFat < oldestBodyFat
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                {formatValue(latestBodyFat - oldestBodyFat, 1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal progress section */}
      {goalWeight && latestWeight && oldestWeight && (
        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">Goal Progress</h3>

          <ProgressBar
            current={latestWeight}
            start={oldestWeight}
            goal={goalWeight}
            label={`${oldestWeight.toFixed(0)} lbs → ${goalWeight.toFixed(0)} lbs`}
          />

          {dailyRate !== 0 && latestWeight && goalWeight && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {dailyRate < 0 && latestWeight > goalWeight && (
                  <>Estimated {Math.ceil(Math.abs((latestWeight - goalWeight) / dailyRate))} days remaining at current rate</>
                )}
                {dailyRate > 0 && latestWeight < goalWeight && (
                  <>Estimated {Math.ceil(Math.abs((goalWeight - latestWeight) / dailyRate))} days remaining at current rate</>
                )}
                {((dailyRate < 0 && latestWeight < goalWeight) ||
                  (dailyRate > 0 && latestWeight > goalWeight)) && (
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