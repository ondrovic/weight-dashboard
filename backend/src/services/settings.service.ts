import UserSettings from '../models/user-settings.model';
import {
  DEFAULT_USER_ID,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_TABLE_METRICS,
  DEFAULT_CHART_METRICS,
  DEFAULT_VISIBLE_METRICS,
  DEFAULT_GOAL_WEIGHT,
  DEFAULT_DARK_MODE
} from '../constants/defaults.constants';

export class SettingsService {
  async getUserSettings(userId = DEFAULT_USER_ID) {
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        displayName: DEFAULT_DISPLAY_NAME,
        tableMetrics: DEFAULT_TABLE_METRICS,
        chartMetrics: DEFAULT_CHART_METRICS,
        defaultVisibleMetrics: DEFAULT_VISIBLE_METRICS,
        goalWeight: DEFAULT_GOAL_WEIGHT,
        darkMode: DEFAULT_DARK_MODE
      });
    }
    return settings;
  }

  async updateUserSettings(userId = DEFAULT_USER_ID, updates: Partial<typeof UserSettings.prototype>) {
    const settings = await this.getUserSettings(userId);

    if (updates.tableMetrics && Array.isArray(updates.tableMetrics)) {
      settings.tableMetrics = updates.tableMetrics.includes('Date')
        ? updates.tableMetrics
        : ['Date', ...updates.tableMetrics.filter(m => m !== 'Date')];
    }

    if (Array.isArray(updates.chartMetrics)) {
      settings.chartMetrics = updates.chartMetrics;
    }

    if (Array.isArray(updates.defaultVisibleMetrics)) {
      settings.defaultVisibleMetrics = updates.defaultVisibleMetrics;
    }

    if (updates.goalWeight !== undefined) {
      settings.goalWeight = updates.goalWeight;
    }

    if (updates.darkMode !== undefined) {
      settings.darkMode = updates.darkMode;
    }

    await settings.save();
    return settings;
  }

  async resetUserSettings(userId = DEFAULT_USER_ID) {
    const settings = await this.getUserSettings(userId);

    settings.tableMetrics = DEFAULT_TABLE_METRICS;
    settings.chartMetrics = DEFAULT_CHART_METRICS;
    settings.defaultVisibleMetrics = DEFAULT_VISIBLE_METRICS;
    settings.goalWeight = DEFAULT_GOAL_WEIGHT;

    await settings.save();
    return settings;
  }
}

export const settingsService = new SettingsService();