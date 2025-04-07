// frontend/src/services/api.ts
import axios from 'axios';
import { WeightEntry, WeightStats, createEmptyWeightStats, processWeightData } from '../types/weightData';

const API_BASE_URL = '/api';

/**
 * API service for weight data
 */
export const weightApi = {
  /**
   * Get all weight data
   */
  async getAllWeightData(): Promise<WeightEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/weight`);

      // Check the structure of the response
      // If it's an array, use it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // If it's an object with a data property that's an array, use that
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      // If we can't determine the structure, return an empty array
      console.error('Unexpected API response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching weight data:', error);
      return [];
    }
  },

  /**
   * Get weight statistics
   */
  async getWeightStats(): Promise<WeightStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/weight/stats`);

      // If the response already matches our expected format, return it
      if (response.data &&
        response.data.count !== undefined &&
        response.data.latest &&
        response.data.oldest &&
        response.data.stats) {
        return response.data as WeightStats;
      }

      // Handle the case where we need to convert the data
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return processWeightData(response.data.data);
      }

      // If we can't determine the structure, return empty stats
      console.error('Unexpected API response structure for stats:', response.data);
      return createEmptyWeightStats();
    } catch (error) {
      console.error('Error fetching weight stats:', error);
      return createEmptyWeightStats();
    }
  },

  /**
   * Get weight data by ID
   */
  async getWeightDataById(id: string): Promise<WeightEntry | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/weight/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching weight data with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Get weight data for a date range
   */
  async getWeightDataByDateRange(startDate: string, endDate: string): Promise<WeightEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/weight/range`, {
        params: { startDate, endDate }
      });

      // Check if response is an array
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Check if response has a data property that's an array
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      console.error('Unexpected API response structure for date range:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching weight data for date range:', error);
      return [];
    }
  },

  /**
   * Upload weight data CSV
   */
  async uploadWeightData(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/weight/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading weight data:', error);
      throw error;
    }
  },

  /**
   * Update weight data by ID
   */
  async updateWeightData(id: string, data: Partial<WeightEntry>): Promise<WeightEntry | null> {
    try {
      const response = await axios.put(`${API_BASE_URL}/weight/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating weight data with ID ${id}:`, error);
      throw error;
    }
  },

  // Add this function to api.ts in the weightApi object

  /**
   * Create a manual weight entry
   * @param entry The weight entry data
   * @returns Response from the API
   */
  async createWeightEntry(entry: Partial<WeightEntry>): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/weight/entry`, entry);
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Error creating weight entry:', error);
      throw error;
    }
  },

  /**
   * Delete weight data by ID
   */
  async deleteWeightData(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/weight/${id}`);
    } catch (error) {
      console.error(`Error deleting weight data with ID ${id}:`, error);
      throw error;
    }
  }
};