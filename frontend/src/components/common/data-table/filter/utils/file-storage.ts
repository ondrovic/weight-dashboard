// Handle saving and loading filter presets

import { FilterPreset } from '../types/filter.types';

const STORAGE_KEY = 'weightTableFilterPresets';

/**
 * Load filter presets from localStorage
 */
export const loadFilterPresets = (): FilterPreset[] => {
  try {
    const savedPresets = localStorage.getItem(STORAGE_KEY);
    if (savedPresets) {
      return JSON.parse(savedPresets) as FilterPreset[];
    }
  } catch (error) {
    console.error('Error loading filter presets from localStorage:', error);
  }
  return [];
};

/**
 * Save filter presets to localStorage
 */
export const saveFilterPresets = (presets: FilterPreset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving filter presets to localStorage:', error);
  }
};