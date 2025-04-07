// backend/src/services/DataService.ts
import fs from 'fs';
import { parseCSV } from '../utils/csvParser';
import { ConversionService } from './ConversionService';
import { RawWeightData, ProcessedWeightData } from '../types/weightData';
import WeightData from '../models/WeightData';

/**
 * Result of the database save operation
 */
interface SaveResult {
  totalRecords: number;
  created: number;
  updated: number;
  skipped: number;
  invalidRecords: number;
  errors: number;
}

/**
 * Service for processing and managing weight data
 */
export class DataService {
  /**
   * Process weight data from a CSV file, detecting format automatically
   * @param filePath Path to the CSV file
   * @returns Processed weight data and import results
   */
  async processData(filePath: string): Promise<ProcessedWeightData[]> {
    try {
      console.log(`Processing file: ${filePath} (${fs.statSync(filePath).size} bytes)`);

      // Read file content
      const fileContent = fs.readFileSync(filePath, 'utf8');

      // Detect file format by checking headers
      const firstLine = fileContent.split('\n')[0];
      const isRawFormat = firstLine.includes('Time') && firstLine.includes('Body Fat');
      const isProcessedFormat = firstLine.includes('Date') ||
        (firstLine.includes('Weight') && firstLine.includes('BMI'));

      console.log(`Detected format: ${isRawFormat ? 'Raw' : isProcessedFormat ? 'Processed' : 'Unknown'}`);

      let allRecords: any[] = [];

      if (isRawFormat) {
        // Parse as raw data from smart scale
        const rawRecords: RawWeightData[] = parseCSV(fileContent);
        console.log(`Parsed ${rawRecords.length} raw records`);

        // Filter out records with too many missing values
        const validRawRecords = this.filterIncompleteRecords(rawRecords);
        console.log(`Filtered to ${validRawRecords.length} valid raw records (removed ${rawRecords.length - validRawRecords.length} incomplete)`);

        // Convert to processed format
        allRecords = ConversionService.convertRawToProcessed(validRawRecords);
        console.log(`Processed ${allRecords.length} records from raw data`);
      } else if (isProcessedFormat) {
        // Parse as already processed data
        const parsedRecords = this.parseProcessedFormatCSV(fileContent);

        // Filter out records with too many missing values
        allRecords = this.filterIncompleteProcessedRecords(parsedRecords);
        console.log(`Parsed ${parsedRecords.length} pre-processed records, filtered to ${allRecords.length} valid`);
      } else {
        console.error('Unknown CSV format - could not detect headers');
        return [];
      }

      // Apply default values for any missing fields
      const processedRecords = this.validateAndApplyDefaults(allRecords);

      // Group records by date and select the most complete for each date
      const dedupedRecords = this.selectBestRecordsByDate(processedRecords);
      console.log(`After deduplication: ${dedupedRecords.length} unique records`);

      // Save to database
      const saveResult = await this.saveToDatabase(dedupedRecords);
      console.log(`Save result: ${JSON.stringify(saveResult)}`);

      // Add import results to the returned data
      const result = [...dedupedRecords] as any;
      result.importResults = saveResult;

      return result;
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  }

  /**
   * Filter out raw records with too many missing values
   * @param records Raw records to filter
   * @returns Filtered records
   */
  private filterIncompleteRecords(records: RawWeightData[]): RawWeightData[] {
    return records.filter(record => {
      // Skip records with no date/time
      if (!record.Time) return false;

      // Count how many fields are missing or marked as --
      const checkFields = [
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

      const missingCount = checkFields.filter(field =>
        !record[field] || record[field] === '--'
      ).length;

      // If more than 3 fields are missing, skip this record
      const maxMissingFields = 3;
      const tooManyMissing = missingCount > maxMissingFields;

      if (tooManyMissing) {
        console.log(`Skipping record with date ${record.Time} - ${missingCount} fields missing`);
      }

      return !tooManyMissing;
    });
  }

  /**
   * Filter out processed records with too many missing values
   * @param records Processed records to filter
   * @returns Filtered records
   */
  private filterIncompleteProcessedRecords(records: any[]): any[] {
    return records.filter(record => {
      // Skip records with no date
      if (!record.Date) return false;

      // Count fields marked as -- or with 0 values (which might indicate missing data)
      const checkFields = [
        'Weight',
        'BMI',
        'Body Fat %',
        'V-Fat',
        'S-Fat',
        'Age',
        'HR',
        'Water %',
        'Muscle Mass'
      ];

      // Count fields that are missing (marked as -- or empty string)
      const missingTextFields = checkFields.filter(field =>
        record[field] === '--' || record[field] === ''
      ).length;

      // Count fields that are 0 (which might indicate missing data in some cases)
      const zeroFields = checkFields.filter(field =>
        record[field] === 0 || record[field] === '0'
      ).length;

      // If more than 3 fields are missing (either -- or 0), skip this record
      const maxMissingFields = 3;

      // We're being stricter with text missing fields than zero values
      const tooManyMissing = missingTextFields > maxMissingFields ||
        (missingTextFields + zeroFields > maxMissingFields + 2);

      if (tooManyMissing) {
        console.log(`Skipping processed record with date ${record.Date} - too many missing fields`);
      }

      return !tooManyMissing;
    });
  }

  /**
   * Select the most complete record for each date
   * @param records All processed records
   * @returns Deduplicated records, keeping only the most complete for each date
   */
  private selectBestRecordsByDate(records: ProcessedWeightData[]): ProcessedWeightData[] {
    // Group records by date
    const recordsByDate = new Map<string, ProcessedWeightData[]>();

    for (const record of records) {
      const date = this.parseDate(record.Date);
      if (!date) continue;

      const dateKey = this.getDateKey(date);

      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }

      recordsByDate.get(dateKey)!.push(record);
    }

    // For each date, select the most complete record
    const result: ProcessedWeightData[] = [];

    for (const [dateKey, dateRecords] of recordsByDate.entries()) {
      if (dateRecords.length === 1) {
        // Only one record for this date, use it
        result.push(dateRecords[0]);
      } else {
        // Multiple records for this date, select the most complete one
        const bestRecord = this.selectMostCompleteRecord(dateRecords);
        result.push(bestRecord);
        console.log(`Selected best record from ${dateRecords.length} records for date ${dateKey}`);
      }
    }

    return result;
  }

  /**
   * Select the most complete record from a list of records for the same date
   * @param records Records for the same date
   * @returns The most complete record
   */
  private selectMostCompleteRecord(records: ProcessedWeightData[]): ProcessedWeightData {
    // Calculate completeness score for each record
    const recordsWithScores = records.map(record => {
      const importantFields = [
        'Weight',
        'BMI',
        'Body Fat %',
        'V-Fat',
        'S-Fat',
        'Age',
        'HR',
        'Water %',
        'Bone Mass %',
        'Protien %',
        'Fat Free Weight',
        'Bone Mass LB',
        'BMR',
        'Muscle Mass'
      ] as (keyof ProcessedWeightData)[];

      // Count valid values (not 0, which might indicate missing data)
      let score = 0;

      for (const field of importantFields) {
        const value = record[field];
        if (value !== undefined && value !== null && value !== 0) {
          score++;
        }
      }

      return { record, score };
    });

    // Sort by score (descending)
    recordsWithScores.sort((a, b) => b.score - a.score);

    // Return the record with the highest score
    return recordsWithScores[0].record;
  }

  /**
   * Parse CSV data that's already in the processed format
   * @param csvText Raw CSV text
   * @returns Array of processed records
   */
  private parseProcessedFormatCSV(csvText: string): any[] {
    if (!csvText || !csvText.trim()) {
      return [];
    }

    try {
      // Split into lines
      const lines = csvText.split('\n');
      if (lines.length <= 1) return [];

      // Get headers
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('Headers found:', headers);

      // Process each line
      const processedRecords: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted values properly
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let j = 0; j < line.length; j++) {
          const char = line[j];

          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }

        // Add the last value
        values.push(currentValue.trim());

        if (values.length !== headers.length) {
          console.warn(`Line ${i} has ${values.length} values but headers has ${headers.length} - line: ${line}`);
          // Try to align values with headers as best as possible
          while (values.length < headers.length) {
            values.push('');
          }
          // If too many values, truncate
          if (values.length > headers.length) {
            values.length = headers.length;
          }
        }

        const record: Record<string, any> = {};

        headers.forEach((header, index) => {
          // Normalize header names
          let normalizedHeader = header;
          if (header === 'Body Fat' || header === 'Body Fat%') {
            normalizedHeader = 'Body Fat %';
          }

          const value = values[index];

          // For Date field, keep as string
          if (normalizedHeader === 'Date') {
            record[normalizedHeader] = value;
          } else {
            // For numeric fields, convert to number
            // Handle missing values (-- or empty)
            if (value === '--' || value === '') {
              record[normalizedHeader] = 0; // Use 0 as placeholder for missing values
            } else {
              record[normalizedHeader] = parseFloat(value) || 0;
            }
          }
        });

        processedRecords.push(record);
      }

      return processedRecords;
    } catch (error) {
      console.error('Error parsing processed format CSV:', error);
      return [];
    }
  }

  /**
   * Validate records and apply default values for missing fields
   * @param records Array of possibly incomplete records
   * @returns Array of validated records with defaults applied
   */
  private validateAndApplyDefaults(records: any[]): ProcessedWeightData[] {
    return records.map(record => {
      // Create a record with all required fields and default values
      const validatedRecord: ProcessedWeightData = {
        'Date': record.Date || this.getCurrentDateFormatted(),
        'Weight': record.Weight ?? 0,
        'BMI': record.BMI ?? 0,
        'Body Fat %': record['Body Fat %'] ?? 0,
        'V-Fat': record['V-Fat'] ?? 0,
        'S-Fat': record['S-Fat'] ?? 0,
        'Age': record.Age ?? 0,
        'HR': record.HR ?? 0,
        'Water %': record['Water %'] ?? 0,
        'Bone Mass %': record['Bone Mass %'] ?? 0,
        'Protien %': record['Protien %'] ?? 0,
        'Fat Free Weight': record['Fat Free Weight'] ?? 0,
        'Bone Mass LB': record['Bone Mass LB'] ?? 0,
        'BMR': record.BMR ?? 0,
        'Muscle Mass': record['Muscle Mass'] ?? 0
      };

      return validatedRecord;
    });
  }

  /**
   * Get current date formatted as MM-DD-YY
   * @returns Formatted date string
   */
  private getCurrentDateFormatted(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(2);
    return `${month}-${day}-${year}`;
  }

  /**
   * Parse a date string from various formats
   * @param dateStr Date string to parse
   * @returns Date object or null if invalid
   */
  private parseDate(dateStr: string): Date | null {
    // Try different date formats
    let date: Date | null = null;
    let month, day, year;

    // Try MM-DD-YY format
    const dashParts = dateStr.split('-');
    if (dashParts.length === 3) {
      [month, day, year] = dashParts.map(part => parseInt(part, 10));
      const fullYear = year < 100 ? 2000 + year : year;
      date = new Date(fullYear, month - 1, day);
    }
    // Try MM/DD/YYYY format
    else {
      const slashParts = dateStr.split('/');
      if (slashParts.length === 3) {
        [month, day, year] = slashParts.map(part => parseInt(part, 10));
        const fullYear = year < 100 ? 2000 + year : year;
        date = new Date(fullYear, month - 1, day);
      }
    }

    return date && !isNaN(date.getTime()) ? date : null;
  }

  /**
   * Generate a unique key for a record based on its date
   * This is used for deduplication
   * @param date Date object
   * @returns String key in YYYY-MM-DD format
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Save processed weight data to the database
   * This implementation prevents duplicates and tracks what happened to each record
   * @param records Processed weight data records
   * @returns Result statistics
   */
  private async saveToDatabase(records: ProcessedWeightData[]): Promise<SaveResult> {
    try {
      console.log(`Preparing to save ${records.length} records to database`);

      // Initialize result counters
      const result: SaveResult = {
        totalRecords: records.length,
        created: 0,
        updated: 0,
        skipped: 0,
        invalidRecords: 0,
        errors: 0
      };

      // Process each record
      for (const record of records) {
        try {
          // Parse the date
          const date = this.parseDate(record.Date);
          if (!date) {
            console.error(`Invalid date format: ${record.Date}`);
            result.invalidRecords++;
            continue;
          }

          // Check if a record with this date already exists
          const existingRecord = await WeightData.findOne({ date });

          if (existingRecord) {
            // Check if the data is identical
            if (this.hasIdenticalData(existingRecord, record)) {
              console.log(`Skipping identical record for date ${record.Date}`);
              result.skipped++;
              continue;
            }

            // Update the existing record
            await WeightData.updateOne(
              { _id: existingRecord._id },
              {
                weight: record.Weight,
                bmi: record.BMI,
                bodyFatPercentage: record['Body Fat %'],
                visceralFat: record['V-Fat'],
                subcutaneousFat: record['S-Fat'],
                metabolicAge: record.Age,
                heartRate: record.HR,
                waterPercentage: record['Water %'],
                boneMassPercentage: record['Bone Mass %'],
                proteinPercentage: record['Protien %'],
                fatFreeWeight: record['Fat Free Weight'],
                boneMassLb: record['Bone Mass LB'],
                bmr: record.BMR,
                muscleMass: record['Muscle Mass']
              }
            );
            console.log(`Updated existing record for date ${record.Date}`);
            result.updated++;
          } else {
            // Create a new record
            await WeightData.create({
              date,
              weight: record.Weight,
              bmi: record.BMI,
              bodyFatPercentage: record['Body Fat %'],
              visceralFat: record['V-Fat'],
              subcutaneousFat: record['S-Fat'],
              metabolicAge: record.Age,
              heartRate: record.HR,
              waterPercentage: record['Water %'],
              boneMassPercentage: record['Bone Mass %'],
              proteinPercentage: record['Protien %'],
              fatFreeWeight: record['Fat Free Weight'],
              boneMassLb: record['Bone Mass LB'],
              bmr: record.BMR,
              muscleMass: record['Muscle Mass']
            });
            console.log(`Created new record for date ${record.Date}`);
            result.created++;
          }
        } catch (error) {
          console.error(`Error saving record for date ${record.Date}:`, error);
          result.errors++;
        }
      }

      console.log(`Database save complete: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  }

  /**
   * Check if two records have the same data (for all fields)
   * This is used to detect if a record has changed
   * @param record1 First record
   * @param record2 Second record
   * @returns True if records have identical data
   */
  private hasIdenticalData(record1: any, record2: ProcessedWeightData): boolean {
    // Compare all numeric fields with a small epsilon to account for floating point precision
    const epsilon = 0.0001;

    return (
      Math.abs(record1.weight - record2.Weight) < epsilon &&
      Math.abs(record1.bmi - record2.BMI) < epsilon &&
      Math.abs(record1.bodyFatPercentage - record2['Body Fat %']) < epsilon &&
      Math.abs(record1.visceralFat - record2['V-Fat']) < epsilon &&
      Math.abs(record1.subcutaneousFat - record2['S-Fat']) < epsilon &&
      Math.abs(record1.metabolicAge - record2.Age) < epsilon &&
      Math.abs(record1.heartRate - record2.HR) < epsilon &&
      Math.abs(record1.waterPercentage - record2['Water %']) < epsilon &&
      Math.abs(record1.boneMassPercentage - record2['Bone Mass %']) < epsilon &&
      Math.abs(record1.proteinPercentage - record2['Protien %']) < epsilon &&
      Math.abs(record1.fatFreeWeight - record2['Fat Free Weight']) < epsilon &&
      Math.abs(record1.boneMassLb - record2['Bone Mass LB']) < epsilon &&
      Math.abs(record1.bmr - record2.BMR) < epsilon &&
      Math.abs(record1.muscleMass - record2['Muscle Mass']) < epsilon
    );
  }

  // /**
  //  * Get all processed weight data from the database
  //  * @returns Array of processed weight data
  //  */
  // async getProcessedData(): Promise<ProcessedWeightData[]> {
  //   try {
  //     // Fetch all records from database, sorted by date (oldest first)
  //     const records = await WeightData.find().sort({ date: 1 });

  //     // Map database records to ProcessedWeightData format
  //     return records.map(record => {
  //       const date = new Date(record.date);
  //       const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`;

  //       return {
  //         Date: formattedDate,
  //         Weight: record.weight,
  //         BMI: record.bmi,
  //         'Body Fat %': record.bodyFatPercentage,
  //         'V-Fat': record.visceralFat,
  //         'S-Fat': record.subcutaneousFat,
  //         Age: record.metabolicAge,
  //         HR: record.heartRate,
  //         'Water %': record.waterPercentage,
  //         'Bone Mass %': record.boneMassPercentage,
  //         'Protien %': record.proteinPercentage,
  //         'Fat Free Weight': record.fatFreeWeight,
  //         'Bone Mass LB': record.boneMassLb,
  //         BMR: record.bmr,
  //         'Muscle Mass': record.muscleMass
  //       };
  //     });
  //   } catch (error) {
  //     console.error('Error fetching data from database:', error);
  //     throw error;
  //   }
  // }
  /**
 * Get all processed weight data from the database
 * @returns Object with count and array of processed weight data
 */
  // async getProcessedData(): Promise<{ count: number; data: ProcessedWeightData[] }> {
  //   try {
  //     // Fetch all records from database, sorted by date (oldest first)
  //     const records = await WeightData.find().sort({ date: 1 });

  //     // Map database records to ProcessedWeightData format
  //     const data = records.map(record => {
  //       const date = new Date(record.date);
  //       const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`;

  //       return {
  //         Date: formattedDate,
  //         Weight: record.weight,
  //         BMI: record.bmi,
  //         'Body Fat %': record.bodyFatPercentage,
  //         'V-Fat': record.visceralFat,
  //         'S-Fat': record.subcutaneousFat,
  //         Age: record.metabolicAge,
  //         HR: record.heartRate,
  //         'Water %': record.waterPercentage,
  //         'Bone Mass %': record.boneMassPercentage,
  //         'Protien %': record.proteinPercentage,
  //         'Fat Free Weight': record.fatFreeWeight,
  //         'Bone Mass LB': record.boneMassLb,
  //         BMR: record.bmr,
  //         'Muscle Mass': record.muscleMass
  //       };
  //     });

  //     return {
  //       count: data.length,
  //       data
  //     };
  //   } catch (error) {
  //     console.error('Error fetching data from database:', error);
  //     throw error;
  //   }
  // }
  /**
 * Get all processed weight data from the database
 * @returns Object with count and array of processed weight data
 */
  async getProcessedData(): Promise<{ count: number; data: ProcessedWeightData[] }> {
    try {
      // Fetch all records from database, sorted by date (oldest first)
      const records = await WeightData.find().sort({ date: 1 });

      // Map database records to ProcessedWeightData format
      const data = records.map(record => {
        const date = new Date(record.date);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getFullYear()).slice(2)}`;

        // Create the processed record with ID
        return {
          // Use optional chaining and type assertion to safely access _id
          id: record?._id?.toString(),
          Date: formattedDate,
          Weight: record.weight,
          BMI: record.bmi,
          'Body Fat %': record.bodyFatPercentage,
          'V-Fat': record.visceralFat,
          'S-Fat': record.subcutaneousFat,
          Age: record.metabolicAge,
          HR: record.heartRate,
          'Water %': record.waterPercentage,
          'Bone Mass %': record.boneMassPercentage,
          'Protien %': record.proteinPercentage,
          'Fat Free Weight': record.fatFreeWeight,
          'Bone Mass LB': record.boneMassLb,
          BMR: record.bmr,
          'Muscle Mass': record.muscleMass
        };
      });

      return {
        count: data.length,
        data
      };
    } catch (error) {
      console.error('Error fetching data from database:', error);
      throw error;
    }
  }

}

