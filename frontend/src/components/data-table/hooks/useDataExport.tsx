import { useMetrics } from '@/contexts/Metrics';

/**
 * Custom hook for data export functionality
 */
export const useDataExport = <T extends Record<string, any>>() => {
  const { tableMetrics } = useMetrics();

  /**
   * Export selected records
   */
  const handleExportSelected = async (
    selectedRows: Record<string, boolean>,
    data: T[],
    onExportRecords?: (records: T[]) => Promise<void>
  ) => {
    const selectedIds = Object.entries(selectedRows)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);

    if (selectedIds.length === 0) {
      alert('No records selected for export.');
      return;
    }

    const selectedRecords = data.filter(record =>
      record.id && selectedIds.includes(record.id)
    );

    if (onExportRecords) {
      try {
        await onExportRecords(selectedRecords);
      } catch (error) {
        console.error('Error exporting selected records:', error);
        alert('Failed to export selected records.');
      }
    } else {
      // Fallback export method
      try {
        const headers = tableMetrics.join(',');
        const rows = selectedRecords.map(record => {
          return tableMetrics
            .map(key => {
              const value = record[key as keyof T];
              return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
            })
            .join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        link.setAttribute('href', url);
        link.setAttribute('download', `weight-data-export-${timestamp}.csv`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting selected records:', error);
        alert('Failed to export selected records.');
      }
    }
  };

  return {
    handleExportSelected
  };
};