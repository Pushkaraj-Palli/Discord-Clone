import mongoose from 'mongoose';

// Direct connection to MongoDB Atlas without using srv format
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Simple singleton pattern for database connection
let instance: typeof mongoose | null = null;

const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  maxPoolSize: 10,
  family: 4
};

async function connectToDatabase() {
  if (instance) {
    return instance;
  }

  try {
    console.log('Connecting to MongoDB (alternative method)');
    instance = await mongoose.connect(MONGODB_URI!, options);
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      instance = null;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      instance = null;
    });
    
    console.log('MongoDB connected successfully (alternative method)');
    
    return instance;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    instance = null;
    throw error;
  }
}

export default connectToDatabase; 