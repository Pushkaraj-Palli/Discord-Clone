import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Server from '@/lib/models/Server';
import Message from '@/lib/models/Message'; // Import the Message model
import { verifyToken } from '@/lib/auth';
import { isValidObjectId } from 'mongoose';

export async function GET(
  req: NextRequest,
  { params }: { params: { serverId: string; channelId: string } }
) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const awaitedParams = await Promise.resolve(params);
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
    const channelExists = server.textChannels.some(c => c._id.toString() === channelId);
    if (!channelExists) {
      return NextResponse.json({ message: 'Channel not found in this server' }, { status: 404 });
    }

    const messages = await Message.find({ server: serverId, channel: channelId })
      .populate('sender', 'username avatarUrl') // Populate sender details
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .limit(100); // Limit to last 100 messages for example

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching messages for channel ${params.channelId}:`, error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
