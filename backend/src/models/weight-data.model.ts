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
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
  bodyFatPercentage: { type: Number, required: true },
  visceralFat: { type: Number, required: true },
  subcutaneousFat: { type: Number, required: true },
  metabolicAge: { type: Number, required: true },
  heartRate: { type: Number, required: true },
  waterPercentage: { type: Number, required: true },
  boneMassPercentage: { type: Number, required: true },
  proteinPercentage: { type: Number, required: true },
  fatFreeWeight: { type: Number, required: true },
  boneMassLb: { type: Number, required: true },
  bmr: { type: Number, required: true },
  muscleMass: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IWeightData>('WeightData', WeightDataSchema);
