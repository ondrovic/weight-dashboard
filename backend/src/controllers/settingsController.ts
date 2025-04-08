// backend/src/controllers/settingsController.ts
import { Request, Response } from 'express';
import UserSettings from '../models/UserSettings';

// Default user ID (since we don't have auth yet)
const DEFAULT_USER_ID = 'default';

// Default metrics values
const DEFAULT_TABLE_METRICS = ['Date', 'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR'];
const DEFAULT_CHART_METRICS = ['Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR'];
const DEFAULT_VISIBLE_METRICS = ['Weight']; // Default to only showing Weight
const DEFAULT_GOAL_WEIGHT = null; // Default to no goal weight
const DEFAULT_DARK_MODE = false; // Default to light mode

/**
 * Get user settings
 * @route GET /api/settings
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, we would get the user ID from authentication
    const userId = DEFAULT_USER_ID;
    
    // Find or create user settings
    let userSettings = await UserSettings.findOne({ userId });
    
    if (!userSettings) {
      // Create default settings if none exists
      userSettings = await UserSettings.create({
        userId,
        displayName: 'Default User',
        tableMetrics: DEFAULT_TABLE_METRICS,
        chartMetrics: DEFAULT_CHART_METRICS,
        defaultVisibleMetrics: DEFAULT_VISIBLE_METRICS,
        goalWeight: DEFAULT_GOAL_WEIGHT,
        darkMode: DEFAULT_DARK_MODE
      });
    }
    
    res.status(200).json(userSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ 
      error: 'Error fetching user settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update user settings
 * @route PUT /api/settings
 */
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, we would get the user ID from authentication
    const userId = DEFAULT_USER_ID;
    
    const { 
      tableMetrics, 
      chartMetrics, 
      defaultVisibleMetrics,
      goalWeight, 
      darkMode 
    } = req.body;
    
    // Find user settings or create if doesn't exist
    let userSettings = await UserSettings.findOne({ userId });
    
    if (!userSettings) {
      // Create with defaults first
      userSettings = await UserSettings.create({
        userId,
        displayName: 'Default User',
        tableMetrics: DEFAULT_TABLE_METRICS,
        chartMetrics: DEFAULT_CHART_METRICS,
        defaultVisibleMetrics: DEFAULT_VISIBLE_METRICS,
        goalWeight: DEFAULT_GOAL_WEIGHT,
        darkMode: DEFAULT_DARK_MODE
      });
    }
    
    // Update settings
    if (tableMetrics !== undefined) {
      // Ensure Date is always included in table metrics
      if (Array.isArray(tableMetrics)) {
        userSettings.tableMetrics = tableMetrics.includes('Date') 
          ? tableMetrics 
          : ['Date', ...tableMetrics.filter(m => m !== 'Date')];
      }
    }
    
    if (chartMetrics !== undefined && Array.isArray(chartMetrics)) {
      userSettings.chartMetrics = chartMetrics;
    }
    
    if (defaultVisibleMetrics !== undefined && Array.isArray(defaultVisibleMetrics)) {
      userSettings.defaultVisibleMetrics = defaultVisibleMetrics;
    }
    
    if (goalWeight !== undefined) {
      userSettings.goalWeight = goalWeight;
    }
    
    if (darkMode !== undefined) {
      userSettings.darkMode = darkMode;
    }
    
    // Save the updated settings
    await userSettings.save();
    
    res.status(200).json(userSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ 
      error: 'Error updating user settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Reset user settings to defaults
 * @route POST /api/settings/reset
 */
export const resetSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real app, we would get the user ID from authentication
    const userId = DEFAULT_USER_ID;
    
    // Find user settings
    let userSettings = await UserSettings.findOne({ userId });
    
    if (!userSettings) {
      // Create with defaults
      userSettings = await UserSettings.create({
        userId,
        displayName: 'Default User',
        tableMetrics: DEFAULT_TABLE_METRICS,
        chartMetrics: DEFAULT_CHART_METRICS,
        defaultVisibleMetrics: DEFAULT_VISIBLE_METRICS,
        goalWeight: DEFAULT_GOAL_WEIGHT,
        darkMode: DEFAULT_DARK_MODE
      });
    } else {
      // Reset to defaults
      userSettings.tableMetrics = DEFAULT_TABLE_METRICS;
      userSettings.chartMetrics = DEFAULT_CHART_METRICS;
      userSettings.defaultVisibleMetrics = DEFAULT_VISIBLE_METRICS;
      userSettings.goalWeight = DEFAULT_GOAL_WEIGHT;
      // Don't reset darkMode to maintain user preference
      
      // Save changes
      await userSettings.save();
    }
    
    res.status(200).json(userSettings);
  } catch (error) {
    console.error('Error resetting user settings:', error);
    res.status(500).json({ 
      error: 'Error resetting user settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};