import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  goalWeight: number | null;
  darkMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: String, required: true, unique: true, default: 'default' },
    displayName: { type: String, default: 'Default User' },
    tableMetrics: { type: [String], required: true },
    chartMetrics: { type: [String], required: true },
    defaultVisibleMetrics: { type: [String], required: true },
    goalWeight: { type: Number, default: null },
    darkMode: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);