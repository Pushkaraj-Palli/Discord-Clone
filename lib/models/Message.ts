import mongoose, { Schema, models, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  channel: mongoose.Schema.Types.ObjectId;
  server: mongoose.Schema.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel", // Assuming a Channel model will be created or referenced within Server
      required: true,
    },
    server: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, "Message content cannot exceed 2000 characters"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
