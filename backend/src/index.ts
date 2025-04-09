import { configureServer, startServer } from './server';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const bootstrap = async () => {
  try {
    await connectDB();
    const { app, PORT } = configureServer();
    startServer(app, PORT);
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
};

bootstrap();