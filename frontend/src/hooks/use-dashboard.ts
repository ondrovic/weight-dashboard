import { useWeightData } from '@/hooks/use-weight-data';
import { useMetrics } from '@/contexts/metrics.context';

export const useDashboard = () => {
  const {
    data,
    stats,
    loading: dataLoading,
    error: dataError,
    refreshData,
  } = useWeightData();

  const { goalWeight, error: settingsError } = useMetrics();

  const convertedGoalWeight = goalWeight === null ? undefined : goalWeight;
  const error = dataError || settingsError;

  return {
    data,
    stats,
    goalWeight: convertedGoalWeight,
    loading: dataLoading,
    error,
    refreshData,
  };
};
