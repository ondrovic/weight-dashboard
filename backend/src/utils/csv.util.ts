import { RawWeightData } from '../types/api/weight-data.types';

/**
 * Parse CSV with robust handling for commas inside quoted fields
 */
export const parseCSV = (csvText: string): RawWeightData[] => {
  if (!csvText?.trim()) return [];

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records: RawWeightData[] = [];

  lines.slice(1).forEach(line => {
    const record: Record<string, string> = {};
    let inQuotes = false;
    let currentField = '';
    let fieldIndex = 0;

    for (let i = 0; i <= line.length; i++) {
      const char = line[i] || ',';
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        record[headers[fieldIndex++]] = currentField.trim();
        currentField = '';
      } else {
        currentField += char;
      }
    }

    records.push(record as RawWeightData);
  });

  return records;
};

/**
 * Serialize data back to CSV
 */
export const serializeToCSV = <T extends Record<string, unknown>>(records: T[]): string => {
  if (!records.length) return '';

  const headers = Object.keys(records[0]);
  const rows = records.map(record =>
    headers.map(header => {
      const val = record[header];
      if (typeof val === 'number') return val.toFixed(2);
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return val ?? '';
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};
