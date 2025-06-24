import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import { z } from "zod";

// Validation schema for status update
const statusSchema = z.object({
  status: z.enum(['online', 'offline', 'idle', 'dnd']),
});

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
    
    try {
      // Verify the token
      const payload = await verifyToken(token);
      
      // Connect to database
      await connectToDatabase();
      
      // Validate request body
      const body = await request.json();
      const validationResult = statusSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      
      const { status } = validationResult.data;
      
      // Find user and update status
      if (!payload.id) {
        return NextResponse.json(
          { error: "Invalid token payload" },
          { status: 401 }
        );
      }
      
      const updatedUser = await User.findByIdAndUpdate(
        payload.id, 
        { status }, 
        { new: true }
      ).select("-password");
      
      if (!updatedUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Return updated user data
      return NextResponse.json({
        message: "Status updated successfully",
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          avatarUrl: updatedUser.avatarUrl,
          status: updatedUser.status,
        }
      });
      
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 