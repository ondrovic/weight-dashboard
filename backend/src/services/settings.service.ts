import UserSettings from '../models/user-settings.model';
import {
  DEFAULT_USER_ID,
  DEFAULT_DISPLAY_NAME,
  DEFAULT_TABLE_METRICS,
  DEFAULT_CHART_METRICS,
  DEFAULT_VISIBLE_METRICS,
  DEFAULT_FORM_FIELD_ORDER,
  DEFAULT_METRIC_LABELS,
  DEFAULT_GOAL_WEIGHT,
  DEFAULT_DARK_MODE,
} from '../constants/defaults.constants';
import {
  normalizeFormFieldOrder,
  sanitizeMetricLabels,
} from '../utils/form-field-order.util';

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
        formFieldOrder: DEFAULT_FORM_FIELD_ORDER,
        metricLabels: DEFAULT_METRIC_LABELS,
        goalWeight: DEFAULT_GOAL_WEIGHT,
        darkMode: DEFAULT_DARK_MODE,
      });
    } else {
      // Self-heal legacy/incomplete settings docs to satisfy DB validators.
      let changed = false;
      if (!Array.isArray(settings.tableMetrics) || settings.tableMetrics.length === 0) {
        settings.tableMetrics = DEFAULT_TABLE_METRICS;
        changed = true;
      }
      if (!Array.isArray(settings.chartMetrics) || settings.chartMetrics.length === 0) {
        settings.chartMetrics = DEFAULT_CHART_METRICS;
        changed = true;
      }
      if (!Array.isArray(settings.defaultVisibleMetrics) || settings.defaultVisibleMetrics.length === 0) {
        settings.defaultVisibleMetrics = DEFAULT_VISIBLE_METRICS;
        changed = true;
      }
      if (settings.goalWeight === undefined) {
        settings.goalWeight = DEFAULT_GOAL_WEIGHT;
        changed = true;
      }
      if (settings.darkMode === undefined) {
        settings.darkMode = DEFAULT_DARK_MODE;
        changed = true;
      }
      if (!Array.isArray(settings.formFieldOrder) || settings.formFieldOrder.length === 0) {
        settings.formFieldOrder = DEFAULT_FORM_FIELD_ORDER;
        changed = true;
      } else {
        const normalized = normalizeFormFieldOrder(settings.formFieldOrder);
        if (JSON.stringify(normalized) !== JSON.stringify(settings.formFieldOrder)) {
          settings.formFieldOrder = normalized;
          changed = true;
        }
      }
      if (settings.metricLabels === undefined || settings.metricLabels === null) {
        settings.metricLabels = { ...DEFAULT_METRIC_LABELS };
        changed = true;
      }
      if (changed) {
        await settings.save();
      }
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

    if (updates.formFieldOrder && Array.isArray(updates.formFieldOrder)) {
      settings.formFieldOrder = normalizeFormFieldOrder(updates.formFieldOrder);
    }

    if (updates.metricLabels !== undefined) {
      settings.metricLabels = sanitizeMetricLabels(
        updates.metricLabels as Record<string, string>,
      );
    }

    await settings.save();
    return settings;
  }

  async resetUserSettings(userId = DEFAULT_USER_ID) {
    const settings = await this.getUserSettings(userId);

    settings.tableMetrics = DEFAULT_TABLE_METRICS;
    settings.chartMetrics = DEFAULT_CHART_METRICS;
    settings.defaultVisibleMetrics = DEFAULT_VISIBLE_METRICS;
    settings.formFieldOrder = DEFAULT_FORM_FIELD_ORDER;
    settings.metricLabels = { ...DEFAULT_METRIC_LABELS };
    settings.goalWeight = DEFAULT_GOAL_WEIGHT;

    await settings.save();
    return settings;
  }
}

export const settingsService = new SettingsService();