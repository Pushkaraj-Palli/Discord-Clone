import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  return NextResponse.json({
    message: "Use POST request with a connection string to test",
    example: {
      "connectionString": "mongodb+srv://username:password@cluster.mongodb.net/database"
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const connectionString = body.connectionString;
    
    if (!connectionString) {
      return NextResponse.json(
        { error: "Connection string is required" },
        { status: 400 }
      );
    }
    
    // Disconnect first if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    console.log("Testing connection to:", connectionString.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, "mongodb+srv://$1:****@"));
    
    try {
      await mongoose.connect(connectionString, {
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        family: 4
      });
      
      const connectionInfo = {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || "unknown",
        name: mongoose.connection.name || "unknown",
        collections: mongoose.connection.db ? 
          (await mongoose.connection.db.listCollections().toArray()).map(c => c.name) : []
      };
      
      // Disconnect after successful test
      await mongoose.disconnect();
      
      return NextResponse.json({
        success: true,
        message: "Connection successful",
        connectionInfo
      });
      
    } catch (error: any) {
      console.error("Connection test error:", error);
      
      return NextResponse.json({
        success: false,
        message: "Connection failed",
        error: {
          name: error?.name || "Unknown Error",
          message: error?.message || "No error message available",
          code: error?.code
        }
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Invalid request",
      error: error?.message || "Unknown error"
    }, { status: 400 });
  }
} 