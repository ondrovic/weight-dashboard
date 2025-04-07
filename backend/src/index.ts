import fs from 'fs';
import path from 'path';
import weightRoutes from './routes/weightRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { connectDB } from './config/db';
import { configureServer, startServer } from './config/server';

// Connect to MongoDB
connectDB();

// Configure the express app
const { app, PORT } = configureServer();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API routes
app.use('/api/weight', weightRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
startServer(app, PORT);