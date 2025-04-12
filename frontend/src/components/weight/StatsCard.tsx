import React, { useMemo } from 'react';
import { WeightStats, createEmptyWeightStats, WeightEntry } from '@/types/weight-data.types';

interface StatsCardProps {
  stats: WeightStats | null;
  loading: boolean;
  filteredData?: WeightEntry[] | null;
}

// Helper function to format values with proper decimal places
const formatValue = (value: number | undefined, decimalPlaces: number = 1): string => {
  if (value === undefined || isNaN(value)) return "N/A";
  return value.toFixed(decimalPlaces);
};

// Helper to calculate statistics for a metric
const calculateStats = (data: WeightEntry[], metric: keyof WeightEntry) => {
  const values = data
    .map(entry => entry[metric] as number | undefined)
    .filter((val): val is number => val !== undefined && !isNaN(val));

  if (values.length === 0) return { min: undefined, max: undefined, avg: undefined };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

  return { min, max, avg };
};

// Reusable stat display component
const StatItem: React.FC<{
  label: string;
  value: number | string | undefined;
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
        {value !== undefined ? `${value}${suffix && ` ${suffix}`}` : 'N/A'}
      </p>
    </div>
  );
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
  stats, 
  loading, 
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
    
    // Calculate stats for weight
    const weightStats = calculateStats(sortedData, 'Weight');
    
    // Return stats object
    return {
      latest,
      oldest,
      count: sortedData.length,
      stats: {
        Weight: weightStats,
        BMI: calculateStats(sortedData, 'BMI'),
        "Body Fat %": calculateStats(sortedData, "Body Fat %"),
        "V-Fat": calculateStats(sortedData, "V-Fat"),
        "S-Fat": calculateStats(sortedData, "S-Fat"),
        Age: calculateStats(sortedData, "Age"),
        HR: calculateStats(sortedData, "HR"),
        "Water %": calculateStats(sortedData, "Water %"),
        "Bone Mass %": calculateStats(sortedData, "Bone Mass %"),
        "Protien %": calculateStats(sortedData, "Protien %"),
        "Fat Free Weight": calculateStats(sortedData, "Fat Free Weight"),
        "Bone Mass LB": calculateStats(sortedData, "Bone Mass LB"),
        BMR: calculateStats(sortedData, "BMR"),
        "Muscle Mass": calculateStats(sortedData, "Muscle Mass")
      }
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
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md justify-center items-center flex flex-col h-full transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Statistics</h2>
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Create a default empty stats object to use for fallbacks
  const emptyStats = createEmptyWeightStats();

  // Extract the stats we need - with proper typing and fallbacks
  const { latest = emptyStats.latest, oldest = emptyStats.oldest, count = 0, stats: statDetails = emptyStats.stats } = effectiveStats;
  
  // Use the Weight stats with fallback
  const weightStats = statDetails.Weight || emptyStats.stats.Weight;

  // Calculate weight change with proper fallbacks
  const latestWeight = latest.Weight;
  const oldestWeight = oldest.Weight;
  const weightChange = latestWeight !== undefined && oldestWeight !== undefined ? latestWeight - oldestWeight : 0;
  const weightChangePercent = oldestWeight && weightChange ? (weightChange / oldestWeight) * 100 : 0;

  // Date range info for display
  const dateRangeInfo = filteredData && stats && filteredData.length > 0 && filteredData.length !== stats.count
    ? `Showing ${filteredData.length} of ${stats.count} records`
    : '';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Statistics</h2>
        {dateRangeInfo && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{dateRangeInfo}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Weight Section */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Current Weight</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatValue(latestWeight)} lbs
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Date: {latest.Date || 'N/A'}
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