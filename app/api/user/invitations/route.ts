import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Server from '@/lib/models/Server';
import User from '@/lib/models/User';
import connectToDatabase from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Get token from Authorization header

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let session;
    try {
      session = await verifyToken(token);
    } catch (error) {
      return new NextResponse("Unauthorized: Invalid token", { status: 401 });
    }

    if (!session?.id) {
      return new NextResponse("Unauthorized: User ID not found in token", { status: 401 });
    }

    const user = await User.findById(session.id).select('email');
    const userEmail = user?.email?.trim().toLowerCase();
    if (!userEmail) return new NextResponse("User not found", { status: 404 });

    const invitations = await Server.find({
      invitations: { $elemMatch: { email: userEmail, status: 'pending' } },
    }, 'name invitations');
    
    const formattedInvitations = invitations.map(server => {
      const pendingForUser = server.invitations.filter(
        (inv: any) => inv.email?.trim().toLowerCase() === userEmail && inv.status === 'pending'
      );
      return pendingForUser.map((inv: any) => ({
        serverId: server._id,
        serverName: server.name,
        invitationId: inv._id,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
      }));
    }).flat();

    return NextResponse.json({ invitations: formattedInvitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
