import mongoose, { Mongoose, Connection } from 'mongoose';

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined; // eslint-disable-line no-var
}

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI || "mongodb+srv://2005pushkarajpalli:ii0UGD0JTAJg8SVV@cluster0.asuwnfx.mongodb.net/discord_clone?retryWrites=true&w=majority&appName=Cluster0";
  
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }
  return uri;
};

const MONGODB_URI = getMongoUri();

console.log("MongoDB connection string format:", 
  MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, "mongodb$1://$2:****@")
);

// Initialize the global Mongoose cache if it doesn't exist
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

// Use the globally cached object
let cached = global.mongoose;

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
      family: 4
    }).then((mongooseInstance) => {
      console.log('MongoDB connected successfully');
      mongooseInstance.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        cached.conn = null;
        cached.promise = null;
      });
      mongooseInstance.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        cached.conn = null;
        cached.promise = null;
      });
      return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to resolve MongoDB connection promise:', error);
    cached.promise = null; // Clear the promise on failure to allow re-attempt
    throw error;
  }
}

export default connectToDatabase; 