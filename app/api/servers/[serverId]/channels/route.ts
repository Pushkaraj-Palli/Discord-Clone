import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Server from '@/lib/models/Server';
import { verifyToken } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { serverId } = params;
    const { name, type } = await req.json();

    console.log(`Received channel creation request: Name - ${name}, Type - ${type}, Server ID - ${serverId}`);

    if (!name || !type) {
      return NextResponse.json({ message: 'Channel name and type are required' }, { status: 400 });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return NextResponse.json({ message: 'Server not found' }, { status: 404 });
    }

    if (server.owner.toString() !== decoded.id) {
      return NextResponse.json({ message: 'Forbidden: Only server owner can add channels' }, { status: 403 });
    }

    if (type === 'text') {
      server.textChannels.push({ name });
      console.log(`Added text channel: ${name}`);
    } else if (type === 'voice') {
      server.voiceChannels.push({ name });
      console.log(`Added voice channel: ${name}`);
    } else {
      return NextResponse.json({ message: 'Invalid channel type' }, { status: 400 });
    }

    await server.save();
    console.log(`Server ${serverId} saved successfully after adding channel.`);

    revalidatePath(`/servers/${serverId}`);

    return NextResponse.json(server, { status: 201 });
  } catch (error: any) {
    console.error(`Error adding channel:`, error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
} 