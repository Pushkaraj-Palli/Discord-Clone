// Simple MongoDB connection test script
const mongoose = require('mongoose');

// MongoDB connection string - replace with your actual connection string
const connectionString = process.argv[2] || 
  "mongodb+srv://2005pushkarajpalli:ii0UGD0JTAJg8SVV@cluster0.asuwnfx.mongodb.net/discord_clone?retryWrites=true&w=majority&appName=Cluster0";

// Hide the password when logging
const sanitizedUri = connectionString.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, "mongodb$1://$2:****@");
console.log(`Attempting to connect to MongoDB: ${sanitizedUri}`);

// Connection options
const options = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  family: 4
};

// Connect to MongoDB
mongoose.connect(connectionString, options)
  .then(() => {
    console.log('✅ MongoDB connected successfully!');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log(`Connected to database: ${db.databaseName}`);
    
    // List collections
    return db.listCollections().toArray();
  })
  .then((collections) => {
    if (collections.length === 0) {
      console.log('No collections found in the database');
    } else {
      console.log('Collections:');
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // Close the connection
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle process termination
process.on('SIGINT', () => {
  mongoose.disconnect().then(() => {
    console.log('MongoDB disconnected through app termination');
    process.exit(0);
  });
}); 