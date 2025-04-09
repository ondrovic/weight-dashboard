// backend/src/controllers/weight.controller.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId } from 'mongoose';
import WeightData from '../models/weight-data.model';
import { DataService } from '../services/data.service';
import { validateUpdateData, convertToDbFieldNames } from '../utils/data.util';

const dataService = new DataService();

const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadWeightData = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const filePath = req.file.path;
    const processedData = await dataService.processData(filePath);

    res.status(200).json({
      message: 'Data processed successfully',
      count: processedData.length,
      preview: processedData.slice(0, 5)
    });
  } catch (error) {
    if (req.file?.path) await fs.promises.unlink(req.file.path);
    res.status(500).json({ error: 'Error processing data', message: (error as Error).message });
  }
};

export const getWeightData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await dataService.getProcessedData();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data', message: (error as Error).message });
  }
};

export const getWeightDataById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  try {
    const record = await WeightData.findById(id);
    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching record', message: (error as Error).message });
  }
};

export const getWeightStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, count } = await dataService.getProcessedData();
    if (count === 0) {
      res.status(200).json({ count: 0, message: 'No data available' });
      return;
    }
    const latest = data[data.length - 1];
    const oldest = data[0];

    res.status(200).json({ count, latest, oldest });
  } catch (error) {
    res.status(500).json({ error: 'Error calculating stats', message: (error as Error).message });
  }
};

export const exportWeightData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data } = await dataService.getProcessedData();
    if (!data.length) {
      res.status(404).json({ error: 'No data available to export' });
      return;
    }

    const headers = Object.keys(data[0]).join(',');
    const csv = [headers, ...data.map(record => Object.values(record).join(','))].join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('weight-data-export.csv').send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Error exporting data', message: (error as Error).message });
  }
};

export const clearAllWeightData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { deletedCount } = await WeightData.deleteMany({});
    res.status(200).json({ message: 'All data cleared successfully', deletedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing data', message: (error as Error).message });
  }
};

export const updateWeightData = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const errors = validateUpdateData(req.body);
  if (errors.length) {
    res.status(400).json({ errors });
    return;
  }

  try {
    const update = convertToDbFieldNames(req.body);
    const updatedRecord = await WeightData.findByIdAndUpdate(id, update, { new: true });
    if (!updatedRecord) res.status(404).json({ error: 'Record not found' });
    else res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: 'Error updating record', message: (error as Error).message });
  }
};

export const getWeightDataRange = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    res.status(400).json({ error: 'Start date and end date are required' });
    return;
  }

  try {
    const records = await WeightData.find({ date: { $gte: new Date(startDate as string), $lte: new Date(endDate as string) } }).sort({ date: 1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data range', message: (error as Error).message });
  }
};

export const deleteWeightData = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await WeightData.findByIdAndDelete(req.params.id);
    if (!deleted) res.status(404).json({ error: 'Record not found' });
    else res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting record', message: (error as Error).message });
  }
};

export const getAllWeightIds = async (_req: Request, res: Response): Promise<void> => {
  try {
    const records = await WeightData.find().select('_id date').sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching record IDs', message: (error as Error).message });
  }
};

export const createWeightEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const newRecord = await WeightData.create(convertToDbFieldNames(req.body));
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: 'Error creating entry', message: (error as Error).message });
  }
};

export const downloadWeightDataTemplate = async (_req: Request, res: Response): Promise<void> => {
  const headers = ['Date', 'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Age', 'HR', 'Water %', 'Bone Mass %', 'Protien %', 'Fat Free Weight', 'Bone Mass LB', 'BMR', 'Muscle Mass'];
  const csvContent = headers.join(',') + '\n';

  res.header('Content-Type', 'text/csv');
  res.attachment('weight-data-template.csv').send(csvContent);
};