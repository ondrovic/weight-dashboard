// backend/src/services/conversion.service.ts
import { RawWeightData, ProcessedWeightData } from '../types/api/weight-data.types';
import { parseDate, formatDateMMDDYY, isValidDate } from '../utils/date.util';
import { extractNumber } from '../utils/number.util';

export class ConversionService {
  static convertRawToProcessed(rawData: RawWeightData[]): ProcessedWeightData[] {
    const validRecords = rawData
      .map(this.normalizeHeaders)
      .map(this.patchRawFromProcessed)
      .filter(this.isCompleteRecord);

    const grouped = this.groupByDate(validRecords);
    const processed = Object.values(grouped).map(this.convertRecord);
    return this.sortByDateDesc(processed);
  }

  private static normalizeHeaders(record: RawWeightData): RawWeightData {
    const map: Record<string, string> = {
      'Muscle': 'Muscle Mass',
      'Skeletal Muscle': 'Muscle Mass',
      'Skeletal Muscles': 'Muscle Mass',
      'Bone': 'Bone Mass',
      'Water': 'Body Water'
    };

    const normalized: RawWeightData = {};
    for (const key in record) {
      const mappedKey = map[key] || key;
      normalized[mappedKey] = record[key];
    }

    return normalized;
  }
  private static patchRawFromProcessed(record: RawWeightData): RawWeightData {
    // Fix for already-processed CSV headers like "Date" instead of "Time"
    if (record.Date && !record.Time) {
      record.Time = record.Date;
    }

    const reverseMap: Record<string, keyof RawWeightData> = {
      'Body Fat %': 'Body Fat',
      'Fat Free Weight': 'Fat-Free Body Weight',
      'S-Fat': 'Subcutaneous Fat',
      'V-Fat': 'Visceral Fat',
      'Water %': 'Body Water',
      'Bone Mass %': 'Bone Mass', // this one gets recalculated anyway
      'Protien %': 'Protein',
      'Age': 'Metabolic Age',
      'HR': 'Heart Rate'
    };

    for (const key in reverseMap) {
      if (record[key] && !record[reverseMap[key]]) {
        record[reverseMap[key]] = record[key];
      }
    }

    // Ensure any missing fields have default values
    const defaultFields = {
      'Body Fat': '0',
      'Fat-Free Body Weight': '0',
      'Subcutaneous Fat': '0',
      'Visceral Fat': '0',
      'Body Water': '0',
      'Muscle Mass': '0',
      'Bone Mass': '0',
      'Protein': '0',
      'BMR': '0',
      'Metabolic Age': '0',
      'Heart Rate': '0',
      'Weight': '0',
      'BMI': '0'
    };

    for (const [key, value] of Object.entries(defaultFields)) {
      if (!record[key as keyof RawWeightData]) {
        record[key as keyof RawWeightData] = value;
      }
    }

    return record;
  }

  // Update the isCompleteRecord method
  private static isCompleteRecord(record: RawWeightData): boolean {
    if (!record.Time) return false;
    // Only require a valid date/time field for basic validation
    return parseDate(record.Time) !== null;
  }

  private static groupByDate(records: RawWeightData[]): Record<string, RawWeightData> {
    const grouped: Record<string, RawWeightData> = {};

    for (const record of records) {
      const date = parseDate(record.Time || '');
      if (!date || !isValidDate(date)) continue;

      const key = formatDateMMDDYY(date);
      if (!grouped[key]) {
        grouped[key] = record;
      }
    }

    return grouped;
  }

  private static convertRecord(record: RawWeightData): ProcessedWeightData {
    const date = parseDate(record.Time || '') || new Date();
    const weight = extractNumber(record.Weight);
    const boneMass = extractNumber(record['Bone Mass']);
    const bonePct = weight > 0 ? (boneMass / weight) * 100 : 0;

    return {
      Date: formatDateMMDDYY(date),
      Weight: weight,
      BMI: extractNumber(record.BMI),
      'Body Fat %': extractNumber(record['Body Fat']),
      'V-Fat': extractNumber(record['Visceral Fat']),
      'S-Fat': extractNumber(record['Subcutaneous Fat']),
      Age: extractNumber(record['Metabolic Age']),
      HR: extractNumber(record['Heart Rate']),
      'Water %': extractNumber(record['Body Water']),
      'Bone Mass %': bonePct,
      'Protien %': extractNumber(record.Protein),
      'Fat Free Weight': extractNumber(record['Fat-Free Body Weight']),
      'Bone Mass LB': boneMass,
      BMR: extractNumber(record.BMR),
      'Muscle Mass': extractNumber(record['Muscle Mass'])
    };
  }

  private static sortByDateDesc(records: ProcessedWeightData[]): ProcessedWeightData[] {
    return records.sort((a, b) => {
      const [ma, da, ya] = a.Date.split('-').map(Number);
      const [mb, db, yb] = b.Date.split('-').map(Number);
      return new Date(2000 + yb, mb - 1, db).getTime() - new Date(2000 + ya, ma - 1, da).getTime();
    });
  }
}