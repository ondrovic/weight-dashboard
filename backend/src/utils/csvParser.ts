// backend/src/utils/csvParser.ts
import { RawWeightData } from '../types/weightData';

/**
 * Parse CSV data with proper handling of quoted fields containing commas
 * This is critical for smart scale data where the date field often has a comma
 * @param csvText Raw CSV text
 * @returns Array of parsed records
 */
export function parseCSV(csvText: string): RawWeightData[] {
  if (!csvText || !csvText.trim()) {
    return [];
  }

  try {
    // Split into lines
    const lines = csvText.split('\n');
    if (lines.length <= 1) return [];

    // Get headers
    const headers = lines[0].split(',');
    
    // Process each line
    const records: RawWeightData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const record: Record<string, string> = {};
      
      // Custom CSV parser to handle quoted fields with commas
      let inQuotes = false;
      let currentField = '';
      let fieldIndex = 0;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          // End of field
          if (fieldIndex < headers.length) {
            record[headers[fieldIndex]] = currentField.trim();
          }
          currentField = '';
          fieldIndex++;
        } else {
          currentField += char;
        }
      }
      
      // Add the last field
      if (fieldIndex < headers.length) {
        record[headers[fieldIndex]] = currentField.trim();
      }
      
      records.push(record as RawWeightData);
    }
    
    return records;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
}

/**
 * Serialize processed weight data to CSV format
 * @param records Array of processed records
 * @returns CSV string
 */
export function serializeToCSV<T extends Record<string, any>>(records: T[]): string {
  if (!records || records.length === 0) {
    return '';
  }
  
  // Get headers from the first record
  const headers = Object.keys(records[0]);
  
  // Create header row
  const csvRows = [headers.join(',')];
  
  // Add data rows
  records.forEach(record => {
    const values = headers.map(header => {
      const value = record[header];
      
      // Format numbers with 2 decimal places
      if (typeof value === 'number') {
        return value.toFixed(2);
      }
      
      // Wrap strings containing commas in quotes
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      
      return value === null || value === undefined ? '' : value;
    });
    
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}