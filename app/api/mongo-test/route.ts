import { NextResponse } from "next/server";
import mongoose from "mongoose";

interface MongoTestResult {
  status: "pending" | "success" | "error";
  message: string;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  } | null;
  connectionInfo: {
    readyState: number;
    host: string;
    name: string;
    collections: string[];
  } | null;
}

export async function GET() {
  const result: MongoTestResult = {
    status: "pending",
    message: "",
    error: null,
    connectionInfo: null
  };

  try {
    // Try a direct connection to MongoDB
    const uri = process.env.MONGODB_URI || "mongodb+srv://2005pushkarajpalli:ii0UGD0JTAJg8SVV@cluster0.asuwnfx.mongodb.net/discord_clone?retryWrites=true&w=majority&appName=Cluster0";
    
    console.log("Mongo test: Attempting direct connection...");
    
    // Disconnect first if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Mongo test: Disconnected from previous connection");
    }
    
    // Try to connect with basic options
    await mongoose.connect(uri, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 60000,
      family: 4
    });
    
    // Get connection info
    result.status = "success";
    result.message = "MongoDB connection successful";
    result.connectionInfo = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || "unknown",
      name: mongoose.connection.name || "unknown",
      collections: mongoose.connection.db ? 
        (await mongoose.connection.db.listCollections().toArray()).map(c => c.name) : []
    };
    
    // Keep connection open for now
    console.log("Mongo test: Connection successful");
  } catch (error: any) { // Use any type for simplicity in error handling
    console.error("Mongo test error:", error);
    result.status = "error";
    result.message = "MongoDB connection failed";
    result.error = {
      name: error?.name || "Unknown Error",
      message: error?.message || "No error message available",
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      code: error?.code
    };
  }

  return NextResponse.json(result);
} 