//backend/src/routes/weightRoutes.ts - Updated with PUT endpoint
import { Router } from 'express';
import { 
  getWeightData, 
  getWeightStats, 
  uploadWeightData, 
  deleteWeightData,
  updateWeightData,
  getWeightDataRange,
  getWeightDataById,
  getAllWeightIds,
  upload, 
  createWeightEntry
} from '../controllers/weightController';

const router = Router();

/**
 * @swagger
 * /api/weight:
 *   get:
 *     summary: Get all processed weight data
 *     tags: [Weight]
 *     responses:
 *       200:
 *         description: A list of processed weight data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessedWeightData'
 */
router.get('/', getWeightData);

/**
 * @swagger
 * /api/weight/stats:
 *   get:
 *     summary: Get weight data statistics
 *     tags: [Weight]
 *     responses:
 *       200:
 *         description: Statistics for the weight data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                 latest:
 *                   $ref: '#/components/schemas/ProcessedWeightData'
 *                 oldest:
 *                   $ref: '#/components/schemas/ProcessedWeightData'
 *                 weightStats:
 *                   type: object
 */
router.get('/stats', getWeightStats);

/**
 * @swagger
 * /api/weight/ids:
 *   get:
 *     summary: Get a list of all weight record IDs
 *     tags: [Weight]
 *     responses:
 *       200:
 *         description: List of all record IDs with dates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: MongoDB ObjectId
 *                   date:
 *                     type: string
 *                     description: Record date in MM/DD/YYYY format
 *       500:
 *         description: Server error
 */
router.get('/ids', getAllWeightIds);

/**
 * @swagger
 * /api/weight/range:
 *   get:
 *     summary: Get weight data for a specific date range
 *     tags: [Weight]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date of the range (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date of the range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: A list of processed weight data within the date range
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProcessedWeightData'
 *       400:
 *         description: Missing required parameters
 */
router.get('/range', getWeightDataRange);

/**
 * @swagger
 * /api/weight/upload:
 *   post:
 *     summary: Upload and process raw weight data
 *     tags: [Weight]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The raw weight data CSV file
 *     responses:
 *       200:
 *         description: Data processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProcessedWeightData'
 *       400:
 *         description: No file uploaded or invalid file format
 *       500:
 *         description: Error processing data
 */
router.post('/upload', upload.single('file'), uploadWeightData);

/**
 * @swagger
 * /api/weight/{id}:
 *   get:
 *     summary: Get a single weight record by ID
 *     tags: [Weight]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB ObjectId of the weight record (24-character hexadecimal string)
 *     responses:
 *       200:
 *         description: The requested weight record
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ProcessedWeightData'
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: MongoDB ObjectId of the record
 *       400:
 *         description: Invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getWeightDataById);

/**
 * @swagger
 * /api/weight/{id}:
 *   put:
 *     summary: Update a weight data record by ID
 *     tags: [Weight]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The weight data record ID (24-character hexadecimal string)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Date:
 *                 type: string
 *                 description: Date in MM/DD/YY or MM/DD/YYYY format
 *               Weight:
 *                 type: number
 *                 description: Body weight in pounds
 *               BMI:
 *                 type: number
 *                 description: Body Mass Index
 *               Body Fat %:
 *                 type: number
 *                 description: Percentage of body fat
 *               V-Fat:
 *                 type: number
 *                 description: Visceral fat level
 *               S-Fat:
 *                 type: number
 *                 description: Subcutaneous fat level
 *               Age:
 *                 type: number
 *                 description: Metabolic age
 *               HR:
 *                 type: number
 *                 description: Heart rate in BPM
 *               Water %:
 *                 type: number
 *                 description: Body water percentage
 *               Bone Mass %:
 *                 type: number
 *                 description: Bone mass percentage
 *               Protien %:
 *                 type: number
 *                 description: Protein percentage
 *               Fat Free Weight:
 *                 type: number
 *                 description: Fat-free body weight in pounds
 *               Bone Mass LB:
 *                 type: number
 *                 description: Bone mass in pounds
 *               BMR:
 *                 type: number
 *                 description: Basal Metabolic Rate
 *               Muscle Mass:
 *                 type: number
 *                 description: Muscle mass in pounds
 *     responses:
 *       200:
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ProcessedWeightData'
 *                 - type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: MongoDB ObjectId of the record
 *       400:
 *         description: Invalid ID format or update data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 validationErrors:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateWeightData);

/**
 * @swagger
 * /api/weight/{id}:
 *   delete:
 *     summary: Delete a weight data record
 *     tags: [Weight]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The weight data record ID
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Record not found
 */
router.delete('/:id', deleteWeightData);

/**
 * @swagger
 * /api/weight/entry:
 *   post:
 *     summary: Create a manual weight data entry
 *     tags: [Weight]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Date
 *               - Weight
 *             properties:
 *               Date:
 *                 type: string
 *                 format: MM-DD-YY
 *                 description: Date of the weight measurement
 *               Weight:
 *                 type: number
 *                 description: Weight in pounds
 *               BMI:
 *                 type: number
 *                 description: Body Mass Index
 *               Body Fat %:
 *                 type: number
 *                 description: Body fat percentage
 *               V-Fat:
 *                 type: number
 *                 description: Visceral fat
 *               S-Fat:
 *                 type: number
 *                 description: Subcutaneous fat
 *               Age:
 *                 type: number
 *                 description: Metabolic age
 *               HR:
 *                 type: number
 *                 description: Heart rate
 *               Water %:
 *                 type: number
 *                 description: Water percentage
 *               Bone Mass %:
 *                 type: number
 *                 description: Bone mass percentage
 *               Protien %:
 *                 type: number
 *                 description: Protein percentage
 *               Fat Free Weight:
 *                 type: number
 *                 description: Fat free weight in pounds
 *               Bone Mass LB:
 *                 type: number
 *                 description: Bone mass in pounds
 *               BMR:
 *                 type: number
 *                 description: Basal Metabolic Rate
 *               Muscle Mass:
 *                 type: number
 *                 description: Muscle mass in pounds
 *     responses:
 *       201:
 *         description: Weight entry created successfully
 *       200:
 *         description: Weight entry updated successfully (if date already exists)
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/entry', createWeightEntry);

export default router;