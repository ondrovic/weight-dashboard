import fs from 'fs';
import WeightData, { IWeightData } from '../models/weight-data.model';
import { parseCSV } from '../utils/csv.util';
import { parseDate, formatDateMMDDYY } from '../utils/date.util';
import { ConversionService } from './conversion.service';
import { RawWeightData, ProcessedWeightData } from '../types/api/weight-data.types';

export class DataService {
  async processData(filePath: string): Promise<ProcessedWeightData[]> {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const firstLine = fileContent.split('\n')[0];
    const isRawFormat = firstLine.includes('Time') && firstLine.includes('Body Fat');
    const isProcessedFormat = firstLine.includes('Date') && firstLine.includes('BMI');

    let parsedRecords: ProcessedWeightData[] = [];

    if (isRawFormat) {
      const rawRecords: RawWeightData[] = parseCSV(fileContent);
      const validRawRecords = this.filterIncompleteRawRecords(rawRecords);
      parsedRecords = ConversionService.convertRawToProcessed(validRawRecords);
    } else if (isProcessedFormat) {
      const records = parseCSV(fileContent) as any[];
      parsedRecords = this.filterIncompleteProcessedRecords(records);
    } else {
      throw new Error('Unknown CSV format.');
    }

    const validatedRecords = this.validateAndApplyDefaults(parsedRecords);
    const dedupedRecords = this.deduplicateRecordsByDate(validatedRecords);
    const savedRecords = await this.saveToDatabase(dedupedRecords);

    return savedRecords;
  }

  async getProcessedData(): Promise<{ count: number; data: ProcessedWeightData[] }> {
    const records: IWeightData[] = await WeightData.find().sort({ date: 1 });

    const data = records.map(record => ({
      id: record._id.toString(),
      Date: formatDateMMDDYY(new Date(record.date)),
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
    }));

    return { count: data.length, data };
  }

  private filterIncompleteRawRecords(records: RawWeightData[]): RawWeightData[] {
    return records.filter(record => {
      if (!record.Time) return false;
      const missing = [
        'Body Fat', 'Fat-Free Body Weight', 'Subcutaneous Fat',
        'Visceral Fat', 'Body Water', 'Muscle Mass', 'Bone Mass',
        'Protein', 'BMR', 'Metabolic Age', 'Heart Rate'
      ].filter(field => !record[field] || record[field] === '--').length;

      return missing <= 3;
    });
  }

  private filterIncompleteProcessedRecords(records: any[]): ProcessedWeightData[] {
    return records.filter(record => {
      if (!record.Date) return false;
      const fields = ['Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Age', 'HR', 'Water %'];
      const missing = fields.filter(field => record[field] === '--' || record[field] === '').length;
      const zeros = fields.filter(field => record[field] === 0 || record[field] === '0').length;

      return missing <= 3 && (missing + zeros) <= 5;
    });
  }

  private validateAndApplyDefaults(records: ProcessedWeightData[]): ProcessedWeightData[] {
    return records.map(record => ({
      Date: record.Date || formatDateMMDDYY(new Date()),
      Weight: record.Weight || 0,
      BMI: record.BMI || 0,
      'Body Fat %': record['Body Fat %'] || 0,
      'V-Fat': record['V-Fat'] || 0,
      'S-Fat': record['S-Fat'] || 0,
      Age: record.Age || 0,
      HR: record.HR || 0,
      'Water %': record['Water %'] || 0,
      'Bone Mass %': record['Bone Mass %'] || 0,
      'Protien %': record['Protien %'] || 0,
      'Fat Free Weight': record['Fat Free Weight'] || 0,
      'Bone Mass LB': record['Bone Mass LB'] || 0,
      BMR: record.BMR || 0,
      'Muscle Mass': record['Muscle Mass'] || 0
    }));
  }

  private deduplicateRecordsByDate(records: ProcessedWeightData[]): ProcessedWeightData[] {
    const map = new Map<string, ProcessedWeightData>();

    records.forEach(record => {
      const dateKey = formatDateMMDDYY(parseDate(record.Date)!);
      if (!map.has(dateKey) || this.recordCompleteness(record) > this.recordCompleteness(map.get(dateKey)!)) {
        map.set(dateKey, record);
      }
    });

    return Array.from(map.values());
  }

  private recordCompleteness(record: ProcessedWeightData): number {
    return Object.values(record).filter(v => v !== 0 && v !== undefined && v !== null).length;
  }

  private async saveToDatabase(records: ProcessedWeightData[]): Promise<ProcessedWeightData[]> {
    const saved: ProcessedWeightData[] = [];

    for (const record of records) {
      const date = parseDate(record.Date);
      if (!date) continue;

      const existing = await WeightData.findOne({ date });
      const doc = { date, ...record };

      if (existing) {
        await WeightData.updateOne({ _id: existing._id }, doc);
        saved.push({ ...record, id: existing._id.toString() });
      } else {
        const newDoc = await WeightData.create(doc);
        saved.push({ ...record, id: newDoc._id.toString() });
      }
    }

    return saved;
  }
}