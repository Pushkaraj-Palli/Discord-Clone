import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Server from '@/lib/models/Server';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id; 

    const { name, icon } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Server name is required' }, { status: 400 });
    }

    const newServer = await Server.create({
      name,
      icon: icon || null,
      owner: userId,
      members: [userId],
    });

    return NextResponse.json(newServer, { status: 201 });
  } catch (error: any) {
    console.error('Server creation error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const token = req.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;

    const servers = await Server.find({ members: userId });
    return NextResponse.json(servers, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching servers:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
} 