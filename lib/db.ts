import mongoose from 'mongoose';

// Format the connection string without using srv format
// Use direct cluster connection instead of DNS SRV lookup which might be blocked
const getMongoUri = () => {
  const uri = process.env.MONGODB_URI || "mongodb+srv://2005pushkarajpalli:ii0UGD0JTAJg8SVV@cluster0.asuwnfx.mongodb.net/discord_clone?retryWrites=true&w=majority&appName=Cluster0";
  return uri;
};

const MONGODB_URI = getMongoUri();

console.log("MongoDB connection string format:", 
  MONGODB_URI.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, "mongodb$1://$2:****@")
);

// Define mongoose global type
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseCache = global as unknown as { mongoose: MongooseCache } 
  ? (global as unknown as { mongoose: MongooseCache }).mongoose 
  : { conn: null, promise: null };

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

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
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