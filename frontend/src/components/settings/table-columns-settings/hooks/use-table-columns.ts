import { useEffect, useState } from 'react';
import { useMetrics } from '@/contexts/Metrics';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const useTableColumns = () => {
  const {
    availableMetrics,
    tableMetrics,
    setTableMetrics,
    loading,
  } = useMetrics();

  const { showToast } = useToast();
  const [selectedColumns, setSelectedColumns] = useState<string[]>(tableMetrics);

  useEffect(() => {
    setSelectedColumns(tableMetrics);
  }, [tableMetrics]);

  const toggleColumn = (key: string) => {
    if (key === 'Date') return;

    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    const all = availableMetrics.map(m => m.key);
    setSelectedColumns(all);
  };

  const selectNone = () => {
    setSelectedColumns(['Date']); // "Date" is always required
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let columns = selectedColumns;
    if (!columns.includes('Date')) {
      columns = ['Date', ...columns];
    }

    try {
      await setTableMetrics(columns);
      showToast({
        message: 'Table columns saved successfully!',
        type: ToastType.Success,
      });
    } catch {
      showToast({
        message: 'Failed to save table columns. Please try again.',
        type: ToastType.Error,
      });
    }
  };

  return {
    availableMetrics,
    selectedColumns,
    toggleColumn,
    selectAll,
    selectNone,
    handleSubmit,
    loading,
  };
};
