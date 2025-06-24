import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function GET(request: NextRequest) {
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
    
    try {
      // Verify the token
      const payload = await verifyToken(token);
      
      // Connect to database
      await connectToDatabase();
      
      // Find user by id
      if (!payload.id) {
        return NextResponse.json(
          { error: "Invalid token payload" },
          { status: 401 }
        );
      }
      
      const user = await User.findById(payload.id).select("-password");
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Return user data
      return NextResponse.json({
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          avatarUrl: user.avatarUrl,
          status: user.status,
          createdAt: user.createdAt,
        }
      });
      
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 