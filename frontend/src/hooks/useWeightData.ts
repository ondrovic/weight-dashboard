// src/hooks/useWeightData.ts
import { useState, useEffect } from 'react';
import { weightApi } from '../services/api';
import { WeightEntry, WeightStats } from '../types/weightData';

export const useWeightData = () => {
  const [data, setData] = useState<WeightEntry[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [weightData, weightStats] = await Promise.all([
        weightApi.getAllWeightData(),
        weightApi.getWeightStats(),
      ]);

      setData(weightData);
      setStats(weightStats);
    } catch (err) {
      setError('Failed to fetch weight data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadData = async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      await weightApi.uploadWeightData(file);
      await fetchData(); // Refresh data after upload

      return true;
    } catch (err) {
      setError('Failed to upload weight data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getWeightDataById = async (id: string) => {
    try {
      return await weightApi.getWeightDataById(id);
    } catch (err) {
      console.error(`Error fetching weight data with ID ${id}:`, err);
      return null;
    }
  };

  const getWeightDataByDateRange = async (startDate: string, endDate: string) => {
    try {
      return await weightApi.getWeightDataByDateRange(startDate, endDate);
    } catch (err) {
      console.error('Error fetching weight data by date range:', err);
      return [];
    }
  };

  const updateWeightData = async (id: string, data: Partial<WeightEntry>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await weightApi.updateWeightData(id, data);
      await fetchData(); // Refresh data after update

      return true;
    } catch (err) {
      setError('Failed to update weight data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
 * Create a manual weight entry
 * @param entry The weight entry data
 * @returns Whether the operation was successful
 */
  const createWeightEntry = async (entry: Partial<WeightEntry>) => {
    try {
      setLoading(true);
      setError(null);

      await weightApi.createWeightEntry(entry);
      await fetchData(); // Refresh data after adding a new entry

      return true;
    } catch (err) {
      setError('Failed to create weight entry');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteWeightData = async (id: string) => {
    try {
      setLoading(true);
      await weightApi.deleteWeightData(id);
      await fetchData(); // Refresh data after deletion
      return true;
    } catch (err) {
      setError('Failed to delete weight data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export all weight data as a CSV file
   */
  const exportData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await weightApi.exportWeightData();
    } catch (err) {
      setError('Failed to export data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Download a CSV template with correct headers
   */
  const downloadTemplate = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await weightApi.downloadWeightDataTemplate();
    } catch (err) {
      setError('Failed to download template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear all weight data after confirmation
   */
  const clearAllData = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await weightApi.clearAllWeightData();
      await fetchData(); // Refresh data after clearing
      
      return true;
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    stats,
    loading,
    error,
    refreshData: fetchData,
    uploadData,
    createWeightEntry, 
    updateWeightData,
    getWeightDataById,
    getWeightDataByDateRange,
    deleteWeightData,
    exportData,
    downloadTemplate,
    clearAllData
  };
};