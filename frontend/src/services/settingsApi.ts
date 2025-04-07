// frontend/src/services/settingsApi.ts
import axios from 'axios';

const API_BASE_URL = '/api';

// Define types
export interface UserSettings {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  goalWeight: number | null;
  darkMode?: boolean;
}

/**
 * API service for user settings
 */
export const settingsApi = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },
  
  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await axios.put(`${API_BASE_URL}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },
  
  /**
   * Update table metrics
   */
  async updateTableMetrics(tableMetrics: string[]): Promise<UserSettings> {
    return this.updateSettings({ tableMetrics });
  },
  
  /**
   * Update chart metrics
   */
  async updateChartMetrics(chartMetrics: string[]): Promise<UserSettings> {
    return this.updateSettings({ chartMetrics });
  },
  
  /**
   * Update goal weight
   */
  async updateGoalWeight(goalWeight: number | null): Promise<UserSettings> {
    return this.updateSettings({ goalWeight });
  },
  
  /**
   * Update dark mode setting
   */
  async updateDarkMode(darkMode: boolean): Promise<UserSettings> {
    return this.updateSettings({ darkMode });
  },
  
  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<UserSettings> {
    try {
      const response = await axios.post(`${API_BASE_URL}/settings/reset`);
      return response.data;
    } catch (error) {
      console.error('Error resetting user settings:', error);
      throw error;
    }
  }
};