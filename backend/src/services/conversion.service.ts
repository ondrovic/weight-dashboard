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
      'Protien %': 'Protein'
    };

    for (const key in reverseMap) {
      if (record[key] && !record[reverseMap[key]]) {
        record[reverseMap[key]] = record[key];
      }
    }

    return record;
  }

  private static isCompleteRecord(record: RawWeightData): boolean {
    if (!record.Time) return false;
    const requiredFields: (keyof RawWeightData)[] = [
      'Body Fat', 'Fat-Free Body Weight', 'Subcutaneous Fat', 'Visceral Fat',
      'Body Water', 'Muscle Mass', 'Bone Mass', 'Protein', 'BMR',
      'Metabolic Age', 'Heart Rate', 'Weight', 'BMI'
    ];
    return !requiredFields.some(field => !record[field] || record[field] === '--');
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