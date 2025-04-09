// src/types/api/weight-data.types.ts

/**
 * Raw weight data interface representing the data format from smart scale
 */
export interface RawWeightData {
    Time?: string;
    Weight?: string;
    BMI?: string;
    'Body Fat'?: string;
    'Fat-Free Body Weight'?: string;
    'Subcutaneous Fat'?: string;
    'Visceral Fat'?: string;
    'Body Water'?: string;
    'Skeletal Muscles'?: string;
    'Muscle Mass'?: string;
    'Bone Mass'?: string;
    Protein?: string;
    BMR?: string;
    'Metabolic Age'?: string;
    'Heart Rate'?: string;
    [key: string]: string | undefined;
  }
  
  /**
   * Processed weight data interface representing the converted data format
   */
  export interface ProcessedWeightData {
    id?: string; // MongoDB ObjectId as string
    Date: string;
    Weight: number;
    BMI: number;
    'Body Fat %': number;
    'V-Fat': number;
    'S-Fat': number;
    Age: number;
    HR: number;
    'Water %': number;
    'Bone Mass %': number;
    'Protien %': number;
    'Fat Free Weight': number;
    'Bone Mass LB': number;
    BMR: number;
    'Muscle Mass': number;
  }
  
  /**
   * @swagger
   * components:
   *   schemas:
   *     ProcessedWeightData:
   *       type: object
   *       properties:
   *         Date:
   *           type: string
   *           description: The date of the measurement
   *           example: 04/05/2025
   *         Weight:
   *           type: number
   *           description: Body weight in pounds
   *           example: 185.5
   *         BMI:
   *           type: number
   *           description: Body Mass Index
   *           example: 24.6
   *         Body Fat %:
   *           type: number
   *           description: Percentage of body fat
   *           example: 18.2
   *         V-Fat:
   *           type: number
   *           description: Visceral fat level
   *           example: 7.5
   *         S-Fat:
   *           type: number
   *           description: Subcutaneous fat level
   *           example: 15.3
   *         Age:
   *           type: number
   *           description: Metabolic age
   *           example: 35
   *         HR:
   *           type: number
   *           description: Heart rate in BPM
   *           example: 68
   *         Water %:
   *           type: number
   *           description: Body water percentage
   *           example: 55.2
   *         Bone Mass %:
   *           type: number
   *           description: Bone mass percentage
   *           example: 4.5
   *         Protien %:
   *           type: number
   *           description: Protein percentage
   *           example: 18.1
   *         Fat Free Weight:
   *           type: number
   *           description: Fat-free body weight in pounds
   *           example: 152.3
   *         Bone Mass LB:
   *           type: number
   *           description: Bone mass in pounds
   *           example: 8.3
   *         BMR:
   *           type: number
   *           description: Basal Metabolic Rate
   *           example: 1850
   *         Muscle Mass:
   *           type: number
   *           description: Muscle mass in pounds
   *           example: 142.6
   */
  