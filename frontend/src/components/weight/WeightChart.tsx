// src/components/weight/WeightChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { WeightEntry } from '../../types/weightData';
import { formatValue } from '../../utils/calculations';
import { useMetrics } from '../../contexts/MetricsContext';

interface WeightChartProps {
  data: WeightEntry[] | null | undefined;
  height?: number;
  goal?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { darkMode } = useMetrics();
  
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-700'} p-3 border shadow-md rounded-md`}>
      <p className="text-sm font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
          {`${entry.name}: ${entry.value !== undefined ? formatValue(entry.value) : 'N/A'} ${entry.unit || ''}`}
        </p>
      ))}
    </div>
  );
};

export const WeightChart: React.FC<WeightChartProps> = ({
  data,
  height = 400,
  goal,
}) => {
  const { chartMetrics, defaultVisibleMetrics, availableMetrics, darkMode } = useMetrics();
  
  // Local state to track which metrics are actively displayed
  const [activeMetrics, setActiveMetrics] = useState<string[]>([]);
  
  // Initialize activeMetrics from defaultVisibleMetrics when component mounts
  useEffect(() => {
    // Filter defaultVisibleMetrics to only include metrics that are in chartMetrics
    const validDefaultMetrics = defaultVisibleMetrics.filter(metric => 
      chartMetrics.includes(metric)
    );
    
    // If no valid default metrics, show all chart metrics
    const initialActiveMetrics = validDefaultMetrics.length > 0 
      ? validDefaultMetrics 
      : chartMetrics;
    
    setActiveMetrics(initialActiveMetrics);
  }, [chartMetrics, defaultVisibleMetrics]);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    return [...data]
      .sort((a, b) => {
        const parseDate = (dateStr: string) => {
          const [month, day, year] = dateStr.split('-');
          return new Date(`20${year}-${month}-${day}`).getTime();
        };

        return parseDate(a.Date) - parseDate(b.Date);
      })
      .map(entry => ({
        ...entry,
        formattedDate: entry.Date
      }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (!chartData.length || activeMetrics.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    activeMetrics.forEach(metric => {
      chartData.forEach(entry => {
        const value = entry[metric as keyof WeightEntry] as number;
        if (value !== undefined && !isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });

    if (goal !== undefined) {
      min = Math.min(min, goal);
      max = Math.max(max, goal);
    }

    if (min === Infinity || max === -Infinity) return [0, 100];

    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData, activeMetrics, goal]);

  const showDots = chartData.length <= 50;

  // Toggle a metric's visibility
  const toggleMetric = (metricKey: string) => {
    setActiveMetrics(prevActiveMetrics => {
      if (prevActiveMetrics.includes(metricKey)) {
        return prevActiveMetrics.filter(key => key !== metricKey);
      } else {
        return [...prevActiveMetrics, metricKey];
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h2>

        {/* Metric toggle buttons */}
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {availableMetrics
            .filter(metric => chartMetrics.includes(metric.key) && metric.key !== 'Date')
            .map(metric => (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeMetrics.includes(metric.key)
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                style={{
                  backgroundColor: activeMetrics.includes(metric.key)
                    ? metric.color
                    : undefined
                }}
              >
                {metric.name}
              </button>
            ))}
        </div>
      </div>

      {chartData.length === 0 || activeMetrics.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {chartData.length === 0 ? 'No data available' : 'No metrics selected for display'}
        </div>
      ) : (
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                opacity={0.3}
                stroke={darkMode ? "#4B5563" : "#E5E7EB"} 
              />
              <XAxis
                dataKey="formattedDate"
                interval="preserveStartEnd"
                minTickGap={20}
                tick={{ fontSize: 12, fill: darkMode ? "#D1D5DB" : "#4B5563" }}
              />
              <YAxis
                domain={yDomain as [number, number]}
                tick={{ fontSize: 12, fill: darkMode ? "#D1D5DB" : "#4B5563" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                onClick={(e) => {
                  toggleMetric(e.dataKey as string);
                }}
                wrapperStyle={{ color: darkMode ? "#E5E7EB" : "#111827" }}
              />
              <Brush
                className='custom-brush'
                dataKey="formattedDate"
                height={60}
                stroke={darkMode ? "#93C5FD" : "#3B82F6"}
                fill={darkMode ? "#1F2937" : "#F3F4F6"}
                tickFormatter={(dateStr) => {
                  const [month, day] = dateStr.split('-');
                  return `${month}/${day}`;
                }}
              />

              {availableMetrics
                .filter(metric => chartMetrics.includes(metric.key) && metric.key !== 'Date')
                .map(metric => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.name}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={showDots ? { r: 3 } : false}
                    activeDot={showDots ? { r: 6 } : false}
                    connectNulls
                    unit={metric.unit}
                    hide={!activeMetrics.includes(metric.key)}
                  />
                ))}
              {goal !== undefined && activeMetrics.includes('Weight') && (
                <ReferenceLine
                  y={goal}
                  label={{
                    value: `Goal: ${goal} lbs`,
                    position: 'insideBottomRight',
                    fontSize: 12,
                    fill: darkMode ? "#E5E7EB" : "#111827"
                  }}
                  stroke="#6366F1"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            Showing data from {chartData[0].Date} to {chartData[chartData.length - 1].Date}
            ({chartData.length} records)
          </p>
        </div>
      )}
    </div>
  );
};