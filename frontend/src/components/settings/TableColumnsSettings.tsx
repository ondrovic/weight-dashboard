// frontend/src/components/settings/TableColumnsSettings.tsx
import React, { useState } from 'react';
import { useMetrics } from '../../contexts/MetricsContext';

export const TableColumnsSettings: React.FC = () => {
  const { 
    availableMetrics, 
    tableMetrics, 
    setTableMetrics, 
    loading 
  } = useMetrics();
  const [isSaved, setIsSaved] = useState(false);
  
  // Create a local state to track selections
  const [selectedColumns, setSelectedColumns] = useState<string[]>(tableMetrics);
  
  // Update local state when context updates
  React.useEffect(() => {
    setSelectedColumns(tableMetrics);
  }, [tableMetrics]);
  
  // Toggle a column's selection status
  const toggleColumn = (key: string) => {
    if (key === 'Date') return; // Date is always required
    
    setSelectedColumns(prev => {
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure Date column is always included
    let columns = selectedColumns;
    if (!columns.includes('Date')) {
      columns = ['Date', ...columns];
    }
    
    await setTableMetrics(columns);
    setIsSaved(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };
  
  // Handle select all
  const selectAll = () => {
    setSelectedColumns(availableMetrics.map(m => m.key));
  };
  
  // Handle select none (except Date)
  const selectNone = () => {
    setSelectedColumns(['Date']);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Table Columns</h2>
      
      <p className="mb-3 text-sm text-gray-500">
        Select which metrics to display in the data table.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {availableMetrics.map(metric => (
            <div 
              key={metric.key} 
              className={`flex items-center p-3 rounded-md ${
                metric.key === 'Date' ? 'bg-gray-100' : 'hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                id={`table-column-${metric.key}`}
                checked={selectedColumns.includes(metric.key)}
                onChange={() => toggleColumn(metric.key)}
                disabled={metric.key === 'Date'}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`table-column-${metric.key}`}
                className={`ml-3 ${
                  metric.key === 'Date' ? 'text-gray-500' : 'text-gray-700'
                }`}
              >
                {metric.name}
                {metric.key === 'Date' && (
                  <span className="ml-1 text-xs text-gray-500">(required)</span>
                )}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={selectAll}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={selectNone}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Select None
          </button>
        </div>
        
        {isSaved && (
          <div className="p-2 bg-green-50 text-green-700 rounded">
            Table columns saved successfully!
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${
            loading 
              ? 'bg-gray-400' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Columns'}
        </button>
      </form>
    </div>
  );
};