import { NextRequest, NextResponse } from "next/server";
// Use require instead of import to avoid TypeScript errors
const bcrypt = require('bcryptjs');
import { z } from "zod";
import connectToDatabase from "@/lib/db";
import connectToDatabaseAlt from "@/lib/db-alternative";
import User from "@/lib/models/User";
import { createToken } from "@/lib/auth";

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Registration request received');
    const body = await request.json();
    console.log('Request body (without password):', { ...body, password: '[REDACTED]' });
    
    // Validate input data
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation error:', validationResult.error.errors);
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, username, password } = validationResult.data;
    
    // Connect to database (try both methods)
    let dbConnected = false;
    
    try {
      console.log('Connecting to MongoDB (primary method)...');
      await connectToDatabase();
      console.log('MongoDB connected successfully (primary)');
      dbConnected = true;
    } catch (primaryDbError) {
      console.error('Primary MongoDB connection error:', primaryDbError);
      
      try {
        console.log('Trying alternative MongoDB connection...');
        await connectToDatabaseAlt();
        console.log('MongoDB connected successfully (alternative)');
        dbConnected = true;
      } catch (altDbError) {
        console.error('Alternative MongoDB connection error:', altDbError);
        return NextResponse.json(
          { error: "Database connection failed. Please try again later." },
          { status: 500 }
        );
      }
    }
    
    if (!dbConnected) {
      return NextResponse.json(
        { error: "Could not connect to database" },
        { status: 500 }
      );
    }
    
    // Check if user already exists
    console.log('Checking if user exists...');
    try {
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }]
      });
      
      if (existingUser) {
        if (existingUser.email === email) {
          console.log('Email already registered:', email);
          return NextResponse.json(
            { error: "Email already registered" },
            { status: 409 }
          );
        }
        if (existingUser.username === username) {
          console.log('Username already taken:', username);
          return NextResponse.json(
            { error: "Username already taken" },
            { status: 409 }
          );
        }
      }
    } catch (findError) {
      console.error('Error checking existing user:', findError);
      return NextResponse.json(
        { error: "Error checking user availability" },
        { status: 500 }
      );
    }
    
    // Hash password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        { error: "Error processing password" },
        { status: 500 }
      );
    }
    
    // Create new user
    console.log('Creating new user in database...');
    let newUser;
    try {
      newUser = await User.create({
        email,
        username,
        password: hashedPassword,
        status: 'offline',
      });
      console.log('User created successfully with ID:', newUser._id.toString());
    } catch (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: "Error creating user account" },
        { status: 500 }
      );
    }
    
    // Remove password from the response
    const user = {
      id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
    };
    
    // Create JWT token
    console.log('Creating JWT token...');
    let token;
    try {
      token = await createToken({ 
        id: newUser._id.toString(),
        email: newUser.email
      });
    } catch (tokenError) {
      console.error('Error creating token:', tokenError);
      return NextResponse.json(
        { error: "Error creating authentication token" },
        { status: 500 }
      );
    }
    
    // Return success response with token
    console.log('Registration successful for user:', username);
    return NextResponse.json({ 
      message: "User registered successfully",
      user,
      token
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
} 