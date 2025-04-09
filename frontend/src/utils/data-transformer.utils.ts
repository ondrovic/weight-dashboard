// frontend/src/utils/dataTransformer.ts
import { WeightEntry } from '../types/weight-data.types';

interface RawWeightEntry {
  Time: string;
  Weight: string;
  BMI: number;
  "Body Fat": string;
  "Fat-Free Body Weight": string;
  "Subcutaneous Fat": string;
  "Visceral Fat": string;
  "Body Water": string;
  "Skeletal Muscles": string;
  "Muscle Mass": string;
  "Bone Mass": string;
  Protein: string;
  BMR: string;
  "Metabolic Age": string;
  "Heart Rate": string;
}

/**
 * Transforms raw data from the smart scale export format to the desired weight data format
 * @param rawData The raw data exported from the smart scale
 * @returns An array of WeightEntry objects in the desired format
 */
export const transformRawData = (rawData: RawWeightEntry[]): WeightEntry[] => {
  return rawData.map(entry => {
    // Extract date from the Time field (assuming format like "2025-01-14 08:30:00")
    const dateParts = entry.Time.split(' ')[0].split('-');
    const formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0].slice(2)}`;
    
    // Parse numeric values from strings
    const parseNumeric = (value: string): number => {
      // Remove any non-numeric characters except decimal points
      const numericValue = value.replace(/[^\d.]/g, '');
      return parseFloat(numericValue) || 0;
    };
    
    return {
      Date: formattedDate,
      Weight: parseNumeric(entry.Weight),
      BMI: entry.BMI,
      "Body Fat %": parseNumeric(entry["Body Fat"]),
      "V-Fat": parseNumeric(entry["Visceral Fat"]),
      "S-Fat": parseNumeric(entry["Subcutaneous Fat"]),
      Age: parseNumeric(entry["Metabolic Age"]),
      HR: parseNumeric(entry["Heart Rate"]),
      "Water %": parseNumeric(entry["Body Water"]),
      "Bone Mass %": parseNumeric(entry["Skeletal Muscles"]),
      "Protien %": parseNumeric(entry.Protein),
      "Fat Free Weight": parseNumeric(entry["Fat-Free Body Weight"]),
      "Bone Mass LB": parseNumeric(entry["Bone Mass"]),
      BMR: parseNumeric(entry.BMR),
      "Muscle Mass": parseNumeric(entry["Muscle Mass"])
    };
  });
};

/**
 * Sample usage in a data fetching function:
 * 
 * import { transformRawData } from '../utils/dataTransformer';
 * import { processWeightData } from '../types/weightData';
 * 
 * const fetchWeightData = async () => {
 *   try {
 *     const response = await fetch('/api/weight-data');
 *     const rawData = await response.json();
 *     const transformedData = transformRawData(rawData);
 *     return processWeightData(transformedData);
 *   } catch (error) {
 *     console.error('Error fetching weight data:', error);
 *     return null;
 *   }
 * };
 */