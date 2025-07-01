import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Server from '@/lib/models/Server';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { serverId: string } }) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const { serverId } = await params;
    const userId = decoded.id;

    if (!serverId) {
      return NextResponse.json({ message: 'Server ID is required' }, { status: 400 });
    }

    const server = await Server.findOne({ _id: serverId, members: userId });

    if (!server) {
      return NextResponse.json({ message: 'Server not found or you do not have access' }, { status: 404 });
    }

    return NextResponse.json(server, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching single server:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
} 