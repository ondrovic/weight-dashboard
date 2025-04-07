// backend/src/controllers/weightController.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { isValidObjectId } from 'mongoose';
import WeightData from '../models/WeightData';
import { DataService } from '../services/DataService';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwriting
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// File filter to validate CSV files
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only CSV files
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  }
});

// Create an instance of the data service
const dataService = new DataService();

/**
 * Upload and process raw weight data
 * @route POST /api/weight/upload
 */
export const uploadWeightData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    console.log('File received:', req.file.originalname, 'Size:', req.file.size, 'bytes');

    try {
      const filePath = req.file.path;

      // Check if file exists and is readable
      await fs.promises.access(filePath, fs.constants.R_OK);

      // Log file size
      const stats = await fs.promises.stat(filePath);
      console.log(`Processing file: ${filePath} (${stats.size} bytes)`);

      // Process the file using the updated DataService
      const processedData = await dataService.processData(filePath);

      res.status(200).json({
        message: 'Data processed and saved to database successfully',
        count: processedData.length,
        data: processedData.slice(0, 5) // Send just a preview of the first 5 records
      });
    } catch (error) {
      console.error('Error processing data:', error);

      // Try to clean up the uploaded file
      if (req.file && req.file.path) {
        try {
          await fs.promises.unlink(req.file.path);
          console.log(`Cleaned up uploaded file: ${req.file.path}`);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }

      res.status(500).json({
        error: 'Error processing data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({
      error: 'Error handling upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all processed weight data
 * @route GET /api/weight
 */
export const getWeightData = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await dataService.getProcessedData();
    // console.log(data)
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      error: 'Error fetching data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get weight data by ID
 * @route GET /api/weight/:id
 */
export const getWeightDataById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'ID parameter is required' });
      return;
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      res.status(400).json({
        error: 'Invalid ID format',
        message: 'The ID must be a valid MongoDB ObjectId (a 24-character hexadecimal string)'
      });
      return;
    }

    const record = await WeightData.findById(id);

    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    // Format the record for API response
    const date = new Date(record.date);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const formattedRecord = {
      id: record._id,
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

    res.status(200).json(formattedRecord);
  } catch (error) {
    console.error('Error fetching weight record:', error);
    res.status(500).json({
      error: 'Error fetching weight record',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


/**
 * Get a list of all weight record IDs
 * @route GET /api/weight/ids
 */
export const getAllWeightIds = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch only the _id field from all records
    const records = await WeightData.find().select('_id date').sort({ date: -1 });

    const recordsList = records.map(record => {
      const date = new Date(record.date);
      return {
        id: record._id,
        date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
      };
    });

    res.status(200).json(recordsList);
  } catch (error) {
    console.error('Error fetching weight record IDs:', error);
    res.status(500).json({
      error: 'Error fetching weight record IDs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get weight data statistics
 * @route GET /api/weight/stats
 */
export const getWeightStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, count } = await dataService.getProcessedData();

    if (count === 0) {
      res.status(200).json({
        count: 0,
        message: 'No data available'
      });
      return;
    }

    const fieldsToSummarize = [
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
    ] as const;

    // Build stats for each field
    const statsByField = fieldsToSummarize.reduce((acc, key) => {
      const values = data.map(item => item[key]);
      const total = values.reduce((sum, val) => sum + val, 0);
      acc[key] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: parseFloat((total / values.length).toFixed(2))
      };
      return acc;
    }, {} as Record<typeof fieldsToSummarize[number], { min: number; max: number; avg: number }>);

    const latest = data[data.length - 1];
    const oldest = data[0];

    const stats = {
      count,
      latest,
      oldest,
      stats: statsByField
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({
      error: 'Error calculating statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


/**
 * Delete a weight data record
 * @route DELETE /api/weight/:id
 */
export const deleteWeightData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedRecord = await WeightData.findByIdAndDelete(id);

    if (!deletedRecord) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      error: 'Error deleting record',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get weight data for a specific date range
 * @route GET /api/weight/range
 */
export const getWeightDataRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    // Find records in the date range
    const records = await WeightData.find({
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });

    // Map to ProcessedWeightData format
    const data = records.map(record => {
      const date = new Date(record.date);
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

      return {
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

    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching data range:', error);
    res.status(500).json({
      error: 'Error fetching data range',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Create a single weight data entry manually
 * @route POST /api/weight/entry
 */
export const createWeightEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      Date: dateStr,
      Weight: weight,
      BMI: bmi,
      "Body Fat %": bodyFatPercentage,
      "V-Fat": visceralFat,
      "S-Fat": subcutaneousFat,
      Age: metabolicAge,
      HR: heartRate,
      "Water %": waterPercentage,
      "Bone Mass %": boneMassPercentage,
      "Protien %": proteinPercentage,
      "Fat Free Weight": fatFreeWeight,
      "Bone Mass LB": boneMassLb,
      BMR: bmr,
      "Muscle Mass": muscleMass
    } = req.body;

    // Validate required fields
    if (!dateStr || !weight) {
      res.status(400).json({ error: 'Date and Weight are required fields' });
      return;
    }

    // Parse the date (MM-DD-YY format) to a Date object
    const [month, day, year] = dateStr.split('-').map((part: string) => parseInt(part, 10));
    const date = new Date(2000 + year, month - 1, day);

    // Validate the date
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Please use MM-DD-YY' });
      return;
    }

    // Check if a record with this date already exists
    const existingRecord = await WeightData.findOne({ date });

    if (existingRecord) {
      // Update existing record
      await WeightData.updateOne(
        { _id: existingRecord._id },
        {
          weight,
          bmi: bmi || 0,
          bodyFatPercentage: bodyFatPercentage || 0,
          visceralFat: visceralFat || 0,
          subcutaneousFat: subcutaneousFat || 0,
          metabolicAge: metabolicAge || 0,
          heartRate: heartRate || 0,
          waterPercentage: waterPercentage || 0,
          boneMassPercentage: boneMassPercentage || 0,
          proteinPercentage: proteinPercentage || 0,
          fatFreeWeight: fatFreeWeight || 0,
          boneMassLb: boneMassLb || 0,
          bmr: bmr || 0,
          muscleMass: muscleMass || 0
        }
      );

      res.status(200).json({
        message: 'Weight entry updated successfully',
        id: existingRecord._id
      });
    } else {
      // Create a new record
      const newRecord = await WeightData.create({
        date,
        weight,
        bmi: bmi || 0,
        bodyFatPercentage: bodyFatPercentage || 0,
        visceralFat: visceralFat || 0,
        subcutaneousFat: subcutaneousFat || 0,
        metabolicAge: metabolicAge || 0,
        heartRate: heartRate || 0,
        waterPercentage: waterPercentage || 0,
        boneMassPercentage: boneMassPercentage || 0,
        proteinPercentage: proteinPercentage || 0,
        fatFreeWeight: fatFreeWeight || 0,
        boneMassLb: boneMassLb || 0,
        bmr: bmr || 0,
        muscleMass: muscleMass || 0
      });

      res.status(201).json({
        message: 'Weight entry created successfully',
        id: newRecord._id
      });
    }
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({
      error: 'Error creating weight entry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update weight data by ID
 * @route PUT /api/weight/:id
 */
export const updateWeightData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({ error: 'ID parameter is required' });
      return;
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      res.status(400).json({
        error: 'Invalid ID format',
        message: 'The ID must be a valid MongoDB ObjectId (a 24-character hexadecimal string)'
      });
      return;
    }

    // Find the record to update
    const record = await WeightData.findById(id);

    if (!record) {
      res.status(404).json({ error: 'Record not found' });
      return;
    }

    // Validate update data
    const validationErrors = validateUpdateData(updateData);
    if (validationErrors.length > 0) {
      res.status(400).json({
        error: 'Invalid update data',
        validationErrors
      });
      return;
    }

    // Convert the frontend field names to database field names
    const dbUpdateData = convertToDbFieldNames(updateData);

    // Update the record
    const updatedRecord = await WeightData.findByIdAndUpdate(
      id,
      dbUpdateData,
      { new: true } // Return the updated document
    );

    // Check if the record was updated
    if (!updatedRecord) {
      res.status(404).json({ error: 'Failed to update record' });
      return;
    }

    // Format the updated record for API response
    const date = new Date(updatedRecord.date);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

    const formattedRecord = {
      id: updatedRecord._id,
      Date: formattedDate,
      Weight: updatedRecord.weight,
      BMI: updatedRecord.bmi,
      'Body Fat %': updatedRecord.bodyFatPercentage,
      'V-Fat': updatedRecord.visceralFat,
      'S-Fat': updatedRecord.subcutaneousFat,
      Age: updatedRecord.metabolicAge,
      HR: updatedRecord.heartRate,
      'Water %': updatedRecord.waterPercentage,
      'Bone Mass %': updatedRecord.boneMassPercentage,
      'Protien %': updatedRecord.proteinPercentage,
      'Fat Free Weight': updatedRecord.fatFreeWeight,
      'Bone Mass LB': updatedRecord.boneMassLb,
      BMR: updatedRecord.bmr,
      'Muscle Mass': updatedRecord.muscleMass
    };

    res.status(200).json(formattedRecord);
  } catch (error) {
    console.error('Error updating weight record:', error);
    res.status(500).json({
      error: 'Error updating weight record',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Validate update data to ensure all fields are of the correct type
 */
const validateUpdateData = (data: any): string[] => {
  const errors: string[] = [];

  // Define expected field types
  const numericFields = [
    'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat',
    'Age', 'HR', 'Water %', 'Bone Mass %', 'Protien %',
    'Fat Free Weight', 'Bone Mass LB', 'BMR', 'Muscle Mass'
  ];

  // Validate date format if provided
  if (data.Date) {
    const dateRegex = /^(0?[1-9]|1[0-2])[\/-](0?[1-9]|[12][0-9]|3[01])[\/-](\d{2}|\d{4})$/;
    if (!dateRegex.test(data.Date)) {
      errors.push('Date must be in MM/DD/YY or MM/DD/YYYY format');
    }
  }

  // Validate numeric fields
  numericFields.forEach(field => {
    if (field in data) {
      const value = data[field];
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field} must be a valid number`);
      }
    }
  });

  return errors;
};

/**
 * Convert frontend field names to database field names
 */
const convertToDbFieldNames = (data: any): Record<string, any> => {
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

  const result: Record<string, any> = {};

  // Convert each field
  Object.keys(data).forEach(key => {
    if (key in fieldMapping) {
      // Special handling for date field
      if (key === 'Date') {
        // Parse the date string
        const dateParts = data[key].split(/[\/-]/);
        let month, day, year;

        if (dateParts.length === 3) {
          month = parseInt(dateParts[0], 10) - 1; // JS months are 0-indexed
          day = parseInt(dateParts[1], 10);
          year = parseInt(dateParts[2], 10);

          // Add century if year is two digits
          if (year < 100) {
            year += 2000;
          }

          const date = new Date(year, month, day);
          result[fieldMapping[key]] = date;
        }
      } else {
        // For all other fields, just convert directly
        result[fieldMapping[key]] = data[key];
      }
    }
  });

  return result;
};