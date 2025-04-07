import mongoose from 'mongoose';

// Get MongoDB URI from environment variables with fallbacks for different environments
const getMongoURI = (): string => {
  // Docker environment (container-to-container communication)
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  
  // Local development with MongoDB installed locally
  if (process.env.NODE_ENV === 'development') {
    // If you have authentication enabled in your local MongoDB
    if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
      return `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost:27017/weight_tracker?authSource=admin`;
    }
    // Default local development connection without auth
    return 'mongodb://localhost:27017/weight_tracker';
  }
  
  // Default fallback with admin credentials (for Docker)
  return 'mongodb://admin:password@localhost:27017/weight_tracker?authSource=admin';
};

const MONGODB_URI = getMongoURI();

// Connect to MongoDB with retry logic
export const connectDB = async (retryCount = 5, delay = 5000): Promise<void> => {
  let currentRetry = 0;
  
  const attemptConnection = async (): Promise<void> => {
    try {
      await mongoose.connect(MONGODB_URI, {
        // Mongoose 6+ doesn't need these options anymore, they're the default
        // But we'll keep them for clarity and backward compatibility
      });
      console.log('MongoDB connected successfully');
      console.log(`Using MongoDB URI: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Mask credentials in logs
    } catch (error) {
      console.error('MongoDB connection error:', error);
      
      if (currentRetry < retryCount) {
        currentRetry++;
        console.log(`Retrying connection (${currentRetry}/${retryCount}) in ${delay / 1000} seconds...`);
        
        // Wait for the specified delay and try again
        setTimeout(attemptConnection, delay);
      } else {
        console.error(`Failed to connect to MongoDB after ${retryCount} attempts`);
        // Exit process with failure in production, but allow continued execution in development
        if (process.env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  };
  
  // Start the connection process
  await attemptConnection();
};

// Disconnect from MongoDB
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});