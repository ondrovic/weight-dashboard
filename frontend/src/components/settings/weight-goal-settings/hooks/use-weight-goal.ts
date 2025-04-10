import { useEffect, useState } from 'react';
import { useMetrics } from '@/contexts/metrics.context';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const useWeightGoal = () => {
  const { goalWeight, setGoalWeight, loading } = useMetrics();
  const { showToast } = useToast();

  const [localGoalWeight, setLocalGoalWeight] = useState<string>(
    goalWeight !== null ? goalWeight.toString() : ''
  );

  useEffect(() => {
    setLocalGoalWeight(goalWeight !== null ? goalWeight.toString() : '');
  }, [goalWeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericGoal = localGoalWeight ? parseFloat(localGoalWeight) : null;

    if (numericGoal !== null && (isNaN(numericGoal) || numericGoal <= 0)) {
      showToast({
        message: 'Please enter a valid weight goal (positive number)',
        type: ToastType.Error,
      });
      return;
    }

    await setGoalWeight(numericGoal);

    showToast({
      message: 'Weight goal saved successfully!',
      type: ToastType.Success,
    });
  };

  return {
    localGoalWeight,
    setLocalGoalWeight,
    handleSubmit,
    loading,
  };
};
