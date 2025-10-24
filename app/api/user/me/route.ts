import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import { isValidBase64DataUrl } from "@/lib/utils/imageUtils";

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
          displayName: user.displayName,
          phoneNumber: user.phoneNumber,
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

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token is required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyToken(token);

    await connectToDatabase();

    if (!payload.id) {
      return NextResponse.json(
        { error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const userId = payload.id;
    const body = await request.json();

    const allowedFields = ['displayName', 'username', 'email', 'phoneNumber', 'avatarUrl'];
    const updates: { [key: string]: any } = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'avatarUrl') {
          // Validate Base64 avatar data
          if (body[field] !== null && body[field] !== '' && !isValidBase64DataUrl(body[field])) {
            return NextResponse.json(
              { error: "Invalid avatar format. Please use a valid image file." },
              { status: 400 }
            );
          }
          updates[field] = body[field];
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // Handle unique constraints for email and username if they are being updated
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username, _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json({ error: "Username already in use" }, { status: 409 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User profile updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        phoneNumber: updatedUser.phoneNumber,
        avatarUrl: updatedUser.avatarUrl,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (error: any) {
    console.error("Patch user error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 