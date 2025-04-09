// frontend/src/utils/calculations.ts
import { WeightEntry, WeightStats } from '@/types/weight-data.types';

/**
 * Calculate BMI from weight (lbs) and height (inches)
 */
export const calculateBMI = (weightLbs: number, heightInches: number): number => {
  // BMI = (weight in kg) / (height in meters)^2
  // Convert weight from lbs to kg
  const weightKg = weightLbs * 0.453592;
  // Convert height from inches to meters
  const heightMeters = heightInches * 0.0254;
  
  return weightKg / (heightMeters * heightMeters);
};

/**
 * Calculate average weight from weight data
 */
export const calculateAverageWeight = (data: WeightEntry[]): number => {
  if (data.length === 0) return 0;
  
  const sum = data.reduce((total, item) => total + item.Weight, 0);
  return sum / data.length;
};

/**
 * Calculate weight change between two data points
 */
export const calculateWeightChange = (current: number, previous: number): number => {
  return current - previous;
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format a numeric value with proper decimal places
 */
export const formatValue = (value: number, decimalPlaces: number = 1): string => {
  return value.toFixed(decimalPlaces);
};

/**
 * Calculate total weight change from stats object
 */
/**
 * Calculate total weight change from stats object
 */
export const calculateTotalWeightChange = (stats: WeightStats | null | undefined): { 
  change: number; 
  percentChange: number; 
  isLoss: boolean;
} => {
  // Return default values if stats is null or undefined
  if (!stats || !stats.latest || !stats.oldest) {
    return {
      change: 0,
      percentChange: 0,
      isLoss: false
    };
  }
  
  // Safely access Weight properties with fallbacks to 0
  const latestWeight = stats.latest.Weight ?? 0;
  const oldestWeight = stats.oldest.Weight ?? 0;
  
  const change = latestWeight - oldestWeight;
  const percentChange = calculatePercentageChange(latestWeight, oldestWeight);
  
  return {
    change,
    percentChange,
    isLoss: change < 0
  };
};

/**
 * Calculate days between two date strings (format: MM-DD-YY)
 */
export const calculateDaysBetween = (startDate: string, endDate: string): number => {
  const parseDate = (dateStr: string): Date => {
    const [month, day, year] = dateStr.split('-');
    return new Date(`20${year}-${month}-${day}`);
  };
  
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  // Calculate difference in milliseconds, then convert to days
  const diffInMs = end.getTime() - start.getTime();
  return Math.abs(Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
};

/**
 * Calculate daily rate of change
 */
export const calculateDailyRate = (
  startWeight: number, 
  endWeight: number, 
  startDate: string, 
  endDate: string
): number => {
  const days = calculateDaysBetween(startDate, endDate);
  if (days === 0) return 0;
  
  const weightChange = endWeight - startWeight;
  return weightChange / days;
};

/**
 * Calculate body fat mass in pounds
 */
export const calculateFatMass = (weight: number, bodyFatPercentage: number): number => {
  return weight * (bodyFatPercentage / 100);
};

/**
 * Calculate caloric deficit/surplus based on weight change
 * 
 * Assumes 3500 calories = 1 pound of fat
 */
export const calculateCaloricBalance = (weightChange: number, days: number): number => {
  if (days === 0) return 0;
  // Weight change in pounds * 3500 calories per pound / number of days
  return (weightChange * 3500) / days;
};

/**
 * Calculate estimated time to reach goal weight based on current rate
 * 
 * @returns Number of days to reach goal
 */
export const calculateDaysToGoalWeight = (
  currentWeight: number,
  goalWeight: number,
  dailyRate: number
): number => {
  if (dailyRate === 0) return Infinity;
  
  const weightToLose = currentWeight - goalWeight;
  // If goal is in the wrong direction of the rate, return infinity
  if ((weightToLose > 0 && dailyRate > 0) || (weightToLose < 0 && dailyRate < 0)) {
    return Infinity;
  }
  
  return Math.abs(Math.ceil(weightToLose / dailyRate));
};