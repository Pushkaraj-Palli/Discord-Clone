/**
 * MongoDB Connection Fixer
 * 
 * This script helps diagnose and fix MongoDB connection issues.
 * Run it with: node fix-mongodb.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI environment variable is not set.");
  console.error("Please create a .env.local file in your project root with MONGODB_URI=your_mongodb_connection_string");
  process.exit(1);
}

console.log("🔧 MongoDB Connection Fixer 🔧");
console.log("==============================");
console.log("This script will help diagnose and fix MongoDB connection issues.\n");

async function checkMongoDB() {
  console.log("1️⃣ Testing your MongoDB connection...");
  
  try {
    // Try to connect with the default URI
    await mongoose.connect(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    
    console.log("✅ MongoDB connection successful!");
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log("No collections found. The database is empty.");
    } else {
      console.log("Collections:");
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
}

async function checkDotEnvFile() {
  console.log("\n2️⃣ Checking .env.local file...");
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envExists = false;
  let envHasMongoUri = false;
  let envHasJwtSecret = false;
  
  try {
    if (fs.existsSync(envPath)) {
      envExists = true;
      console.log("✅ .env.local file exists");
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      envHasMongoUri = envContent.includes('MONGODB_URI=');
      envHasJwtSecret = envContent.includes('JWT_SECRET=');
      
      if (envHasMongoUri) {
        console.log("✅ MONGODB_URI is defined in .env.local");
      } else {
        console.log("❌ MONGODB_URI is not defined in .env.local");
      }
      
      if (envHasJwtSecret) {
        console.log("✅ JWT_SECRET is defined in .env.local");
      } else {
        console.log("❌ JWT_SECRET is not defined in .env.local");
      }
    } else {
      console.log("❌ .env.local file does not exist");
    }
  } catch (error) {
    console.error("Error checking .env.local file:", error.message);
  }
  
  return { envExists, envHasMongoUri, envHasJwtSecret };
}

async function fixEnvFile() {
  console.log("\n3️⃣ Creating/updating .env.local file...");
  
  const envPath = path.join(process.cwd(), '.env.local');
  const jwtSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const envContent = `MONGODB_URI=${MONGODB_URI}\nJWT_SECRET=${jwtSecret}\n`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env.local file created/updated with MONGODB_URI and JWT_SECRET");
    return true;
  } catch (error) {
    console.error("❌ Failed to create/update .env.local file:", error.message);
    return false;
  }
}

async function checkNetworkConnectivity() {
  console.log("\n4️⃣ Checking network connectivity to MongoDB Atlas...");
  
  // Extract host from connection string
  const hostMatch = MONGODB_URI.match(/mongodb\+srv:\/\/[^@]+@([^\/]+)/);
  const host = hostMatch ? hostMatch[1] : 'cluster0.asuwnfx.mongodb.net';
  
  console.log(`Testing connectivity to: ${host}`);
  
  return new Promise((resolve) => {
    // Use ping on Windows
    exec(`ping -n 4 ${host}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Cannot reach ${host}: ${error.message}`);
        console.log("This might indicate network issues or DNS problems.");
        resolve(false);
        return;
      }
      
      if (stderr) {
        console.error(`Error: ${stderr}`);
        resolve(false);
        return;
      }
      
      if (stdout.includes('Request timed out') || stdout.includes('Destination host unreachable')) {
        console.error(`❌ Cannot reach ${host} - requests timed out`);
        console.log("This might indicate network issues, firewall blocks, or DNS problems.");
        resolve(false);
      } else {
        console.log(`✅ Successfully reached ${host}`);
        resolve(true);
      }
    });
  });
}

async function restartNextServer() {
  return new Promise((resolve) => {
    rl.question("\nDo you want to restart the Next.js development server? (y/n): ", (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log("\nRestarting Next.js development server...");
        console.log("Please wait. This may take a moment.");
        console.log("Once the server is restarted, try registering again.");
        
        exec('npx next dev', (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Failed to restart server: ${error.message}`);
          }
          resolve();
        });
      } else {
        console.log("\nSkipping server restart.");
        console.log("Remember to restart your server manually with: npm run dev");
        resolve();
      }
    });
  });
}

async function run() {
  try {
    const mongoConnected = await checkMongoDB();
    const { envExists, envHasMongoUri, envHasJwtSecret } = await checkDotEnvFile();
    const networkConnectivity = await checkNetworkConnectivity();
    
    console.log("\n📊 Connection Diagnosis:");
    console.log("------------------------");
    console.log(`MongoDB Connection: ${mongoConnected ? '✅ Working' : '❌ Failed'}`);
    console.log(`.env.local File: ${envExists ? '✅ Exists' : '❌ Missing'}`);
    console.log(`MONGODB_URI: ${envHasMongoUri ? '✅ Defined' : '❌ Missing'}`);
    console.log(`JWT_SECRET: ${envHasJwtSecret ? '✅ Defined' : '❌ Missing'}`);
    console.log(`Network Connectivity: ${networkConnectivity ? '✅ Working' : '❌ Issues'}`);
    
    if (!mongoConnected || !envExists || !envHasMongoUri || !envHasJwtSecret) {
      console.log("\n🔧 Recommended Fixes:");
      
      if (!envExists || !envHasMongoUri || !envHasJwtSecret) {
        rl.question("\nDo you want to create/update your .env.local file with the correct MongoDB URI? (y/n): ", async (answer) => {
          if (answer.toLowerCase() === 'y') {
            await fixEnvFile();
          }
          
          console.log("\n✨ All fixes have been applied!");
          console.log("Try registering again. If you still have issues, check your MongoDB Atlas account settings.");
          
          await restartNextServer();
          rl.close();
        });
      } else {
        console.log("\n✨ Your configuration looks correct, but there are still connection issues.");
        console.log("Possible causes:");
        console.log("1. Your MongoDB Atlas IP whitelist might be restricting access");
        console.log("2. Network/firewall issues blocking the connection");
        console.log("3. MongoDB Atlas service might be experiencing issues");
        
        console.log("\nRecommendations:");
        console.log("1. Check your MongoDB Atlas network access settings");
        console.log("2. Add your current IP to the allowed list in MongoDB Atlas");
        console.log("3. Try using a direct connection string instead of SRV format");
        
        await restartNextServer();
        rl.close();
      }
    } else {
      console.log("\n✨ Everything looks good! Your MongoDB connection is working correctly.");
      rl.close();
    }
  } catch (error) {
    console.error("An error occurred during diagnosis:", error);
    rl.close();
  }
}

// Start the diagnostic process
run(); 