// backend/src/services/conversionService.ts
import { RawWeightData, ProcessedWeightData } from '../types/weightData';
import { parseDate, formatDateMMDDYY, isValidDate } from '../utils/dateFormatter';
import { extractNumber } from '../utils/numberUtils';

/**
 * Service for converting raw weight data to processed format
 * with complete deduplication and data validation
 */
export class ConversionService {
  /**
   * Convert raw weight data to processed format with deduplication
   * @param rawData Raw weight data from smart scale
   * @returns Processed weight data
   */
  static convertRawToProcessed(rawData: RawWeightData[]): ProcessedWeightData[] {
    // Step 1: Filter out incomplete records
    const validRecords = this.filterValidRecords(rawData);
    
    // Step 2: Group by date and keep the most complete record for each date
    const groupedByDate = this.groupByDate(validRecords);
    
    // Step 3: Convert each record to the processed format
    const processedRecords = Object.values(groupedByDate).map(record => 
      this.convertRecord(record)
    );
    
    // Step 4: Sort by date (newest first)
    return this.sortByDate(processedRecords);
  }
  
  /**
   * Filter out incomplete records
   * @param records Raw weight data records
   * @returns Filtered valid records
   */
  private static filterValidRecords(records: RawWeightData[]): RawWeightData[] {
    return records.filter(record => {
      // Skip records with no date/time
      if (!record.Time) return false;
      
      // Skip records with incomplete data (marked as --)
      const requiredFields = [
        'Body Fat',
        'Fat-Free Body Weight',
        'Subcutaneous Fat',
        'Visceral Fat',
        'Body Water',
        'Muscle Mass',
        'Bone Mass',
        'Protein',
        'BMR',
        'Metabolic Age',
        'Heart Rate'
      ] as (keyof RawWeightData)[];
      
      return !requiredFields.some(field => 
        !record[field] || record[field] === '--'
      );
    });
  }
  
  /**
   * Group records by date, keeping the most complete record for each date
   * @param records Raw weight data records
   * @returns Record grouped by date
   */
  private static groupByDate(records: RawWeightData[]): Record<string, RawWeightData> {
    const result: Record<string, RawWeightData> = {};
    
    records.forEach(record => {
      if (!record.Time) return;
      
      const date = parseDate(record.Time);
      if (!date || !isValidDate(date)) return;
      
      const dateKey = formatDateMMDDYY(date);
      
      // If we don't have a record for this date yet, or this record is more complete,
      // use this record (for simplicity, we're using the first complete record for each date)
      if (!result[dateKey]) {
        result[dateKey] = record;
      }
    });
    
    return result;
  }
  
  /**
   * Convert a single record to the processed format
   * @param record Raw weight data record
   * @returns Processed weight data record
   */
  private static convertRecord(record: RawWeightData): ProcessedWeightData {
    // Parse the date
    let formattedDate = '';
    
    if (record.Time) {
      const date = parseDate(record.Time);
      if (date && isValidDate(date)) {
        formattedDate = formatDateMMDDYY(date);
      }
    }
    
    // Calculate bone mass percentage
    const boneMass = extractNumber(record['Bone Mass']);
    const weight = extractNumber(record.Weight);
    const boneMassPercentage = weight > 0 ? (boneMass / weight) * 100 : 0;
    
    // Create the processed record
    return {
      'Date': formattedDate,
      'Weight': weight,
      'BMI': extractNumber(record.BMI),
      'Body Fat %': extractNumber(record['Body Fat']),
      'V-Fat': extractNumber(record['Visceral Fat']),
      'S-Fat': extractNumber(record['Subcutaneous Fat']),
      'Age': extractNumber(record['Metabolic Age']),
      'HR': extractNumber(record['Heart Rate']),
      'Water %': extractNumber(record['Body Water']),
      'Bone Mass %': boneMassPercentage,
      'Protien %': extractNumber(record.Protein),
      'Fat Free Weight': extractNumber(record['Fat-Free Body Weight']),
      'Bone Mass LB': boneMass,
      'BMR': extractNumber(record.BMR),
      'Muscle Mass': extractNumber(record['Muscle Mass'])
    };
  }
  
  /**
   * Sort records by date (newest first)
   * @param records Processed weight data records
   * @returns Sorted records
   */
  private static sortByDate(records: ProcessedWeightData[]): ProcessedWeightData[] {
    return [...records].sort((a, b) => {
      const dateParts1 = a.Date.split('-');
      const dateParts2 = b.Date.split('-');
      
      // Convert MM-DD-YY to YYYY-MM-DD for proper comparison
      const date1 = new Date(
        2000 + parseInt(dateParts1[2]), 
        parseInt(dateParts1[0]) - 1, 
        parseInt(dateParts1[1])
      );
      
      const date2 = new Date(
        2000 + parseInt(dateParts2[2]), 
        parseInt(dateParts2[0]) - 1, 
        parseInt(dateParts2[1])
      );
      
      return date2.getTime() - date1.getTime();
    });
  }
}