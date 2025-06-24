import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import mongoose from "mongoose";
import { getJwtSecretKey } from "@/lib/auth";

export async function GET() {
  const results = {
    mongodb: {
      uri: process.env.MONGODB_URI ? "Configured" : "Missing",
      connection: "Not tested",
      database: "Not tested",
      collections: [] as string[]
    },
    jwt: {
      secret: process.env.JWT_SECRET ? "Configured" : "Missing"
    }
  };

  // Test MongoDB connection
  try {
    await connectToDatabase();
    results.mongodb.connection = "Success";
    
    // Get current database name and check if connection exists
    const connection = mongoose.connection;
    if (connection && connection.db) {
      const db = connection.db;
      results.mongodb.database = db.databaseName;
      
      // List collections
      const collections = await db.listCollections().toArray();
      results.mongodb.collections = collections.map(c => c.name);
    } else {
      results.mongodb.database = "Not available";
    }
  } catch (error) {
    results.mongodb.connection = `Failed: ${(error as Error).message}`;
  }

  // Test JWT secret
  try {
    await getJwtSecretKey();
    results.jwt.secret = "Valid";
  } catch (error) {
    results.jwt.secret = `Invalid: ${(error as Error).message}`;
  }

  return NextResponse.json(results);
} 