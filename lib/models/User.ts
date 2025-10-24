import mongoose, { Schema, models } from "mongoose";

export interface IUser {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  status?: 'online' | 'offline' | 'idle' | 'dnd';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    displayName: {
      type: String,
      trim: true,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null, // Will be generated as Base64 on first login if null
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'idle', 'dnd'],
      default: 'offline',
    },
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

// Check if the model is already defined to prevent model redefinition error in Next.js development
const User = models.User || mongoose.model<IUser>("User", userSchema);

export default User; 