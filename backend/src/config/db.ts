
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connects to MongoDB using MONGO_URI from .env
 */
export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};
