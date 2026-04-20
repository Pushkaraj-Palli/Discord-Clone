import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Server from '@/lib/models/Server';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const awaitedParams = await params;
    const { serverId, channelId } = awaitedParams;

    if (!isValidObjectId(serverId) || !isValidObjectId(channelId)) {
      return NextResponse.json({ message: 'Invalid server or channel ID' }, { status: 400 });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return NextResponse.json({ message: 'Server not found' }, { status: 404 });
    }

    // Check if the user is a member of the server
    if (!server.members.includes(userId)) {
      return NextResponse.json({ message: 'Forbidden: Not a member of this server' }, { status: 403 });
    }

    // Check if the channel exists within the server
    const channelExists = server.textChannels.some((c: any) => c._id.toString() === channelId);
    if (!channelExists) {
      return NextResponse.json({ message: 'Channel not found in this server' }, { status: 404 });
    }

    const messages = await Message.find({ server: serverId, channel: channelId })
      .populate({ path: 'sender', model: User, select: 'username avatarUrl' }) // Populate sender details
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .limit(100); // Limit to last 100 messages for example

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching messages:`, error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string; channelId: string }> }
) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const { serverId, channelId } = await params;
    const { content } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ message: 'Content is required' }, { status: 400 });
    }

    if (!isValidObjectId(serverId) || !isValidObjectId(channelId)) {
      return NextResponse.json({ message: 'Invalid server or channel ID' }, { status: 400 });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return NextResponse.json({ message: 'Server not found' }, { status: 404 });
    }

    // Check if the user is a member of the server
    if (!server.members.includes(userId)) {
      return NextResponse.json({ message: 'Forbidden: Not a member of this server' }, { status: 403 });
    }

    // Check if the channel exists within the server
    const channelExists = server.textChannels.some((c: any) => c._id.toString() === channelId);
    if (!channelExists) {
      return NextResponse.json({ message: 'Channel not found in this server' }, { status: 404 });
    }

    const newMessage = await Message.create({
      content,
      sender: userId,
      server: serverId,
      channel: channelId,
      timestamp: new Date()
    });

    // Populate sender info before returning
    const populatedMessage = await Message.findById(newMessage._id).populate({ path: 'sender', model: User, select: 'username avatarUrl' });

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error: any) {
    console.error(`Error sending message:`, error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
