import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await settingsService.getUserSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await settingsService.updateUserSettings(undefined, req.body);
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resetSettings = async (_: Request, res: Response): Promise<void> => {
  try {
    const reset = await settingsService.resetUserSettings();
    res.status(200).json(reset);
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};