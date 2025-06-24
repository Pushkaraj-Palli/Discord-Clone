import mongoose from 'mongoose';

// Format the connection string without using srv format
// Use direct cluster connection instead of DNS SRV lookup which might be blocked
const getMongoUri = () => {
  const uri = process.env.MONGODB_URI || "mongodb+srv://2005pushkarajpalli:ii0UGD0JTAJg8SVV@cluster0.asuwnfx.mongodb.net/discord_clone?retryWrites=true&w=majority&appName=Cluster0";
  
  // If we're already using a direct connection format, return it as is
  if (uri.startsWith('mongodb://')) {
    return uri;
  }
  
  try {
    // Try to convert srv format to direct connection (this is a rough conversion)
    if (uri.startsWith('mongodb+srv://')) {
      // For example: mongodb+srv://user:pass@cluster.host.mongodb.net/dbname
      // becomes: mongodb://user:pass@cluster-shard-00-00.host.mongodb.net:27017,cluster-shard-00-01.host.mongodb.net:27017,cluster-shard-00-02.host.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-abcdef&authSource=admin
      
      console.log("Using MongoDB direct connection format");
      
      // Extract the essential parts from the srv format
      const srvUri = new URL(uri);
      const userPass = srvUri.username ? `${srvUri.username}:${srvUri.password}@` : '';
      const host = srvUri.hostname;
      
      // Extract database name from pathname or search params
      let dbName = 'discord_clone';
      if (srvUri.pathname && srvUri.pathname !== '/') {
        dbName = srvUri.pathname.substring(1); // Remove leading slash
      }
      
      // Check if the hostname follows the Atlas pattern
      if (host.includes('.mongodb.net')) {
        const clusterPrefix = host.split('.')[0];
        
        // Construct direct connection URI with 3 replicas (standard for Atlas)
        return `mongodb://${userPass}${clusterPrefix}-shard-00-00.${host.substring(clusterPrefix.length+1)}:27017,${clusterPrefix}-shard-00-01.${host.substring(clusterPrefix.length+1)}:27017,${clusterPrefix}-shard-00-02.${host.substring(clusterPrefix.length+1)}:27017/${dbName}?ssl=true&replicaSet=atlas-cluster&authSource=admin`;
      }
    }
  } catch (e) {
    console.warn("Failed to convert MongoDB SRV URI to direct connection:", e);
  }
  
  // Fall back to the original URI if conversion fails
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

// Use type casting to ensure global.mongoose is properly typed
const globalWithMongoose = global as unknown as {
  mongoose: MongooseCache;
};

// Initialize cached with a default value
let cached: MongooseCache = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

// If cached wasn't previously set, initialize it
if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = cached;
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  // Reset the promise if it previously failed
  if (cached.promise && cached.conn === null) {
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,  // 45 seconds
      serverSelectionTimeoutMS: 60000, // 1 minute
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4 // Use IPv4, skip trying IPv6
    };

    console.log('Connecting to MongoDB database: discord_clone');
    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('MongoDB connected successfully');
        
        // Set up connection error handler
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          cached.conn = null;
          cached.promise = null;
        });
        
        // Handle disconnection
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected');
          cached.conn = null;
          cached.promise = null;
        });
        
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error during setup:', error);
      cached.promise = null;
      throw error;
    }
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to resolve MongoDB connection promise:', error);
    cached.promise = null;
    throw error;
  }
}

export default connectToDatabase; 