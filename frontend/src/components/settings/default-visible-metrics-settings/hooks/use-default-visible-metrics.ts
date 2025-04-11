import { useEffect, useState } from 'react';
import { useMetrics } from '@/contexts/Metrics';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const useDefaultVisibleMetrics = () => {
  const {
    availableMetrics,
    chartMetrics,
    defaultVisibleMetrics,
    setDefaultVisibleMetrics,
    loading,
  } = useMetrics();

  const { showToast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(defaultVisibleMetrics);

  useEffect(() => {
    setSelectedMetrics(defaultVisibleMetrics);
  }, [defaultVisibleMetrics]);

  const toggleMetric = (key: string) => {
    if (key === 'Date' || !chartMetrics.includes(key)) return;

    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    const all = chartMetrics.filter(key => key !== 'Date');
    setSelectedMetrics(all);
  };

  const selectNone = () => {
    setSelectedMetrics([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const metrics = selectedMetrics.filter(key => key !== 'Date');

    try {
      await setDefaultVisibleMetrics(metrics);
      showToast({
        message: 'Default visible metrics saved successfully!',
        type: ToastType.Success,
      });
    } catch {
      showToast({
        message: 'Failed to save default visible metrics.',
        type: ToastType.Error,
      });
    }
  };

  return {
    availableMetrics,
    chartMetrics,
    selectedMetrics,
    toggleMetric,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  };
};
