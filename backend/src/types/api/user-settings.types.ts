// src/types/api/user-settings.types.ts

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: Unique identifier for the user
 *           example: "default"
 *         displayName:
 *           type: string
 *           description: Display name for the user
 *           example: "Default User"
 *         tableMetrics:
 *           type: array
 *           description: Metrics to display in table view
 *           items:
 *             type: string
 *           example: ["Date", "Weight", "BMI", "Body Fat %", "V-Fat", "S-Fat", "Water %", "BMR"]
 *         chartMetrics:
 *           type: array
 *           description: Metrics to display in chart view
 *           items:
 *             type: string
 *           example: ["Weight", "BMI", "Body Fat %", "V-Fat", "S-Fat", "Water %", "BMR"]
 *         defaultVisibleMetrics:
 *           type: array
 *           description: Metrics that are visible by default
 *           items:
 *             type: string
 *           example: ["Weight"]
 *         goalWeight:
 *           type: number
 *           nullable: true
 *           description: Target weight goal for the user
 *           example: 180
 *         darkMode:
 *           type: boolean
 *           description: Whether dark mode is enabled
 *           example: false
 *         formFieldOrder:
 *           type: array
 *           description: Display order of fields on the weight entry form
 *           items:
 *             type: string
 *         metricLabels:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Custom display names for metrics (key to label)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the settings were last updated
 */

export interface UserSettings {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  formFieldOrder: string[];
  metricLabels: Record<string, string>;
  goalWeight: number | null;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}
