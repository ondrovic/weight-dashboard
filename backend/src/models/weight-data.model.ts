// backend/src/models/weight-data.model.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWeightData extends Document {
  _id: Types.ObjectId; // explicitly define the type of _id
  date: Date;
  weight: number;
  bmi: number;
  bodyFatPercentage: number;
  visceralFat: number;
  subcutaneousFat: number;
  metabolicAge: number;
  heartRate: number;
  waterPercentage: number;
  boneMassPercentage: number;
  proteinPercentage: number;
  fatFreeWeight: number;
  boneMassLb: number;
  bmr: number;
  muscleMass: number;
}

const WeightDataSchema: Schema = new Schema({
  date: { type: Date, required: true },
  weight: { type: Number, required: true, default: 0 },
  bmi: { type: Number, required: true, default: 0 },
  bodyFatPercentage: { type: Number, required: true, default: 0 },
  visceralFat: { type: Number, required: true, default: 0 },
  subcutaneousFat: { type: Number, required: true, default: 0 },
  metabolicAge: { type: Number, required: true, default: 0 },
  heartRate: { type: Number, required: true, default: 0 },
  waterPercentage: { type: Number, required: true, default: 0 },
  boneMassPercentage: { type: Number, required: true, default: 0 },
  proteinPercentage: { type: Number, required: true, default: 0 },
  fatFreeWeight: { type: Number, required: true, default: 0 },
  boneMassLb: { type: Number, required: true, default: 0 },
  bmr: { type: Number, required: true, default: 0 },
  muscleMass: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export default mongoose.model<IWeightData>('WeightData', WeightDataSchema);
