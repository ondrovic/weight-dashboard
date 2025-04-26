// import React, { useState, useEffect } from 'react';
// import { useDashboard } from '@/hooks/use-dashboard';
// import { WeightChart } from '@/components/weight/DataChart';
// import { StatsCard } from '@/components/weight/StatsCard';
// import { WeightMetricsCard } from '@/components/weight/DataMetricsCard';
// import { WeightEntry } from '@/types/weight-data.types';

// export const WeightDashboardPage: React.FC = () => {
//   const {
//     data,
//     stats,
//     goalWeight,
//     loading,
//     error,
//     refreshData,
//   } = useDashboard();

//   // State for the brush indices
//   const [brushIndices, setBrushIndices] = useState<{
//     startIndex: number;
//     endIndex: number;
//   }>({
//     startIndex: 0,
//     endIndex: 0
//   });

//   // Function to handle brush changes
//   const handleBrushChange = (startIndex: number, endIndex: number) => {
//     setBrushIndices({ startIndex, endIndex });
//   };

//   // Initialize brush indices when data is loaded
//   useEffect(() => {
//     if (data && Array.isArray(data) && data.length > 0) {
//       setBrushIndices({
//         startIndex: 0,
//         endIndex: data.length - 1
//       });
//     }
//   }, [data]);

//   // Filter data based on brush indices
//   const getFilteredData = (): WeightEntry[] => {
//     if (!data || !Array.isArray(data) || data.length === 0) {
//       return [];
//     }

//     // Sort data by date
//     const sortedData = [...data].sort((a, b) => {
//       const parseDate = (dateStr: string) => {
//         const [month, day, year] = dateStr.split('-');
//         return new Date(`20${year}-${month}-${day}`).getTime();
//       };
      
//       return parseDate(a.Date) - parseDate(b.Date);
//     });
    
//     // Return the sliced data based on brush indices
//     const { startIndex, endIndex } = brushIndices;
//     return sortedData.slice(startIndex, endIndex + 1);
//   };

//   const filteredData = getFilteredData();

//   return (
//     <div className="w-full">
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           {refreshData && (
//             <button
//               onClick={refreshData}
//               className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
//             >
//               Try Again
//             </button>
//           )}
//         </div>
//       )}

//       {/* Stats cards row */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
//         <StatsCard 
//           stats={stats} 
//           loading={loading} 
//           filteredData={filteredData}
//         />
//         <WeightMetricsCard 
//           stats={stats} 
//           loading={loading} 
//           goalWeight={goalWeight} 
//           filteredData={filteredData}
//         />
//       </div>

//       {/* Weight chart */}
//       <div className="mb-4">
//         <WeightChart 
//           data={data} 
//           goal={goalWeight} 
//           height={400} 
//           onBrushChange={handleBrushChange}
//           brushStartIndex={brushIndices.startIndex}
//           brushEndIndex={brushIndices.endIndex}
//         />
//       </div>

//       {/* Additional information */}
//       <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
//         <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About This Dashboard</h2>
//         <p className="text-gray-700 dark:text-gray-300">
//           This dashboard displays your tracking data over time. The stats cards show a summary of your
//           current weight metrics, while the chart visualizes your progress. You can toggle different metrics
//           in the chart to focus on specific aspects of your health journey.
//         </p>
//         <p className="text-gray-700 dark:text-gray-300 mt-2">
//           To add new data, navigate to the Data Entry page using the sidebar or quick actions. There you can
//           manually enter new measurements or upload a CSV file from your smart scale.
//         </p>
//         <p className="text-gray-700 dark:text-gray-300 mt-2">
//           Your display preferences and goal weight are automatically saved to your account and will persist across devices.
//           Use the brush control at the bottom of the chart to analyze specific time periods - all statistics will update automatically.
//         </p>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/use-dashboard';
import { WeightChart } from '@/components/weight/DataChart';
import { StatsCard } from '@/components/weight/StatsCard';
import { WeightMetricsCard } from '@/components/weight/DataMetricsCard';
import { WeightEntry } from '@/types/weight-data.types';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const WeightDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    data,
    stats,
    goalWeight,
    loading,
    error,
    refreshData,
  } = useDashboard();

  // State for the brush indices
  const [brushIndices, setBrushIndices] = useState<{
    startIndex: number;
    endIndex: number;
  }>({
    startIndex: 0,
    endIndex: 0
  });

  // Function to handle brush changes
  const handleBrushChange = (startIndex: number, endIndex: number) => {
    setBrushIndices({ startIndex, endIndex });
  };

  // Initialize brush indices when data is loaded
  useEffect(() => {
    if (data && Array.isArray(data) && data.length > 0) {
      setBrushIndices({
        startIndex: 0,
        endIndex: data.length - 1
      });
    }
  }, [data]);

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      showToast({
        message: error,
        type: ToastType.Error,
      });
    }
  }, [error, refreshData, showToast]);

  // Filter data based on brush indices
  const getFilteredData = (): WeightEntry[] => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const [month, day, year] = dateStr.split('-');
        return new Date(`20${year}-${month}-${day}`).getTime();
      };
      
      return parseDate(a.Date) - parseDate(b.Date);
    });
    
    // Return the sliced data based on brush indices
    const { startIndex, endIndex } = brushIndices;
    return sortedData.slice(startIndex, endIndex + 1);
  };

  const filteredData = getFilteredData();

  return (
    <div className="w-full">
      {/* Stats cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <StatsCard 
          stats={stats} 
          loading={loading} 
          filteredData={filteredData}
        />
        <WeightMetricsCard 
          stats={stats} 
          loading={loading} 
          goalWeight={goalWeight} 
          filteredData={filteredData}
        />
      </div>

      {/* Weight chart */}
      <div className="mb-4">
        <WeightChart 
          data={data} 
          goal={goalWeight} 
          height={400} 
          onBrushChange={handleBrushChange}
          brushStartIndex={brushIndices.startIndex}
          brushEndIndex={brushIndices.endIndex}
        />
      </div>

      {/* Additional information */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About This Dashboard</h2>
        <p className="text-gray-700 dark:text-gray-300">
          This dashboard displays your tracking data over time. The stats cards show a summary of your
          current weight metrics, while the chart visualizes your progress. You can toggle different metrics
          in the chart to focus on specific aspects of your health journey.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          To add new data, navigate to the Data Entry page using the sidebar or quick actions. There you can
          manually enter new measurements or upload a CSV file from your smart scale.
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Your display preferences and goal weight are automatically saved to your account and will persist across devices.
          Use the brush control at the bottom of the chart to analyze specific time periods - all statistics will update automatically.
        </p>
      </div>
    </div>
  );
};