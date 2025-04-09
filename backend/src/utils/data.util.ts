// backend/src/utils/data.util.ts
import { ProcessedWeightData } from '../types/api/weight-data.types';
import { parseDate } from './date.util';

export const validateUpdateData = (data: Record<string, unknown>): string[] => {
  const errors: string[] = [];
  const numericFields = [
    'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat',
    'Age', 'HR', 'Water %', 'Bone Mass %', 'Protien %',
    'Fat Free Weight', 'Bone Mass LB', 'BMR', 'Muscle Mass'
  ];

  if (data.Date && typeof data.Date === 'string') {
    const date = parseDate(data.Date);
    if (!date) {
      errors.push('Invalid date format. Use MM-DD-YY or MM/DD/YYYY');
    }
  }

  numericFields.forEach(field => {
    if (field in data && typeof data[field] !== 'number') {
      errors.push(`${field} must be a valid number`);
    }
  });

  return errors;
};

export const convertToDbFieldNames = (data: Record<string, unknown>): Partial<ProcessedWeightData> => {
  const fieldMapping: Record<string, string> = {
    'Date': 'date',
    'Weight': 'weight',
    'BMI': 'bmi',
    'Body Fat %': 'bodyFatPercentage',
    'V-Fat': 'visceralFat',
    'S-Fat': 'subcutaneousFat',
    'Age': 'metabolicAge',
    'HR': 'heartRate',
    'Water %': 'waterPercentage',
    'Bone Mass %': 'boneMassPercentage',
    'Protien %': 'proteinPercentage',
    'Fat Free Weight': 'fatFreeWeight',
    'Bone Mass LB': 'boneMassLb',
    'BMR': 'bmr',
    'Muscle Mass': 'muscleMass'
  };

  const dbData: Record<string, unknown> = {};

  Object.keys(data).forEach(key => {
    if (key in fieldMapping) {
      if (key === 'Date' && typeof data[key] === 'string') {
        const parsedDate = parseDate(data[key] as string);
        if (parsedDate) {
          dbData[fieldMapping[key]] = parsedDate;
        }
      } else {
        dbData[fieldMapping[key]] = data[key];
      }
    }
  });

  // Ensure all required fields have at least a default value
  if (!dbData.date) dbData.date = new Date();
  if (!dbData.weight) dbData.weight = 0;
  if (!dbData.bmi) dbData.bmi = 0;
  if (!dbData.bodyFatPercentage) dbData.bodyFatPercentage = 0;
  if (!dbData.visceralFat) dbData.visceralFat = 0;
  if (!dbData.subcutaneousFat) dbData.subcutaneousFat = 0;
  if (!dbData.metabolicAge) dbData.metabolicAge = 0;
  if (!dbData.heartRate) dbData.heartRate = 0;
  if (!dbData.waterPercentage) dbData.waterPercentage = 0;
  if (!dbData.boneMassPercentage) dbData.boneMassPercentage = 0;
  if (!dbData.proteinPercentage) dbData.proteinPercentage = 0;
  if (!dbData.fatFreeWeight) dbData.fatFreeWeight = 0;
  if (!dbData.boneMassLb) dbData.boneMassLb = 0;
  if (!dbData.bmr) dbData.bmr = 0;
  if (!dbData.muscleMass) dbData.muscleMass = 0;

  return dbData as Partial<ProcessedWeightData>;
};