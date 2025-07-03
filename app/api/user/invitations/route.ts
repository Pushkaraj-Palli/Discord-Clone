import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Server from '@/lib/models/Server';
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

    if (!session?.email) {
      return new NextResponse("Unauthorized: User email not found in token", { status: 401 });
    }

    const userEmail = session.email;

    const invitations = await Server.find({
      "invitations.email": userEmail,
      "invitations.status": "pending",
    }, 'name invitations'); // Select name and invitations field

    const formattedInvitations = invitations.map(server => {
      const pendingForUser = server.invitations.filter(
        (inv: any) => inv.email === userEmail && inv.status === 'pending'
      );
      return pendingForUser.map((inv: any) => ({
        serverId: server._id,
        serverName: server.name,
        invitationId: inv._id,
        invitedBy: inv.invitedBy, // You might want to populate this with user details later
        createdAt: inv.createdAt,
      }));
    }).flat(); // Flatten the array of arrays

    console.log('Formatted Invitations Sent to Client:', formattedInvitations);

    return NextResponse.json({ invitations: formattedInvitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 