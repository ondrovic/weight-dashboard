// src/hooks/use-weight-data.ts
import { useState, useEffect } from 'react';
import { weightApi } from '@/services/api.service';
import { WeightEntry, WeightStats } from '@/types/weight-data.types';

export const useWeightData = (): {
  data: WeightEntry[];
  stats: WeightStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  uploadData: (file: File) => Promise<boolean>;
  createWeightEntry: (entry: Partial<WeightEntry>) => Promise<boolean>;
  updateWeightData: (id: string, update: Partial<WeightEntry>) => Promise<boolean>;
  deleteWeightData: (id: string) => Promise<boolean>;
  getWeightDataById: (id: string) => Promise<WeightEntry | null>;
  getWeightDataByDateRange: (startDate: string, endDate: string) => Promise<WeightEntry[]>;
  exportData: () => Promise<void>;
  downloadTemplate: () => Promise<void>;
  clearAllData: () => Promise<boolean>;
} => {
  const [data, setData] = useState<WeightEntry[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
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

  // const uploadData = async (file: File): Promise<void> => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     await weightApi.uploadWeightData(file);
  //     await fetchData();
  //   } catch (err) {
  //     setError('Failed to upload weight data');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const uploadData = async (file: File): Promise<boolean> => {
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
  
  

  const getWeightDataById = async (id: string): Promise<WeightEntry | null> => {
    try {
      return await weightApi.getWeightDataById(id);
    } catch (err) {
      console.error(`Error fetching weight data with ID ${id}:`, err);
      return null;
    }
  };

  const getWeightDataByDateRange = async (
    startDate: string,
    endDate: string
  ): Promise<WeightEntry[]> => {
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
      await fetchData();
      return true;
    } catch (err) {
      setError('Failed to update weight data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createWeightEntry = async (entry: Partial<WeightEntry>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await weightApi.createWeightEntry(entry);
      await fetchData();
      return true;
    } catch (err) {
      setError('Failed to create weight entry');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteWeightData = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await weightApi.deleteWeightData(id);
      await fetchData();
      return true;
    } catch (err) {
      setError('Failed to delete weight data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  const clearAllData = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await weightApi.clearAllWeightData();
      await fetchData();
      return true;
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    deleteWeightData,
    getWeightDataById,
    getWeightDataByDateRange,
    exportData,
    downloadTemplate,
    clearAllData,
  };
};
