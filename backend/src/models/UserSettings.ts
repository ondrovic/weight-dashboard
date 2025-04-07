// backend/src/models/UserSettings.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface representing the MongoDB document
export interface IUserSettings extends Document {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  goalWeight: number | null;
  darkMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create schema
const UserSettingsSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: 'default' // For now, we'll use a default user since we don't have auth
    },
    displayName: {
      type: String,
      default: 'Default User'
    },
    tableMetrics: {
      type: [String],
      default: ['Date', 'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR']
    },
    chartMetrics: {
      type: [String],
      default: ['Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR']
    },
    goalWeight: {
      type: Number,
      default: null
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create and export model
export default mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);