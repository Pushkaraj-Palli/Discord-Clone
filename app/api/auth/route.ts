import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import connectToDatabaseAlt from "@/lib/db-alternative";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Login request received');
    
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }
    
    console.log('Request body (without password):', {...body, password: '[REDACTED]'});
    
    // Validate input data
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // Connect to database with timeout
    console.log('Connecting to MongoDB...');
    
    try {
      // Try primary connection first with timeout
      const connectionPromise = connectToDatabase();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      console.log('MongoDB connected successfully');
    } catch (primaryDbError) {
      console.error('Primary MongoDB connection error:', primaryDbError);
      
      try {
        console.log('Trying alternative MongoDB connection...');
        const altConnectionPromise = connectToDatabaseAlt();
        const altTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Alt connection timeout')), 5000)
        );
        
        await Promise.race([altConnectionPromise, altTimeoutPromise]);
        console.log('MongoDB connected successfully (alternative)');
      } catch (altDbError) {
        console.error('Alternative MongoDB connection error:', altDbError);
        return NextResponse.json(
          { error: "Database connection failed. Please try again later." },
          { status: 500 }
        );
      }
    }
    
    // Find user by email
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    console.log('User found, verifying password');
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    
    // Update user status to online
    user.status = 'online';
    await user.save();
    
    // Create user object without password
    const userResponse = {
      id: user._id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      status: user.status,
    };
    
    // Create JWT token
    console.log('Creating JWT token');
    const token = await createToken({ 
      id: user._id.toString(),
      email: user.email
    });
    
    // Return success response with token
    console.log('Login successful');
    const response = NextResponse.json({
      message: "Login successful",
      user: userResponse,
      token
    });
    
    // Add security headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 