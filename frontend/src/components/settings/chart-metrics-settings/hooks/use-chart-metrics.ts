import { useEffect, useState } from 'react';
import { useMetrics } from '@/contexts/metrics.context';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const useChartMetrics = () => {
  const {
    availableMetrics,
    chartMetrics,
    setChartMetrics,
    loading,
  } = useMetrics();

  const { showToast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(chartMetrics);

  useEffect(() => {
    setSelectedMetrics(chartMetrics);
  }, [chartMetrics]);

  const toggleMetric = (key: string) => {
    if (key === 'Date') return;
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    const all = availableMetrics.filter(m => m.key !== 'Date').map(m => m.key);
    setSelectedMetrics(all);
  };

  const selectNone = () => {
    setSelectedMetrics([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metrics = selectedMetrics.filter(key => key !== 'Date');
    try {
      await setChartMetrics(metrics);
      showToast({
        message: 'Chart metrics saved successfully!',
        type: ToastType.Success,
      });
    } catch {
      showToast({
        message: 'Failed to save chart metrics.',
        type: ToastType.Error,
      });
    }
  };

  return {
    availableMetrics,
    selectedMetrics,
    toggleMetric,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  };
};
