import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify the token
    try {
      const payload = await verifyToken(token);
      
      // Connect to database
      await connectToDatabase();
      
      // Update user status to offline
      if (payload.id) {
        await User.findByIdAndUpdate(payload.id, { status: 'offline' });
      }
      
      return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 