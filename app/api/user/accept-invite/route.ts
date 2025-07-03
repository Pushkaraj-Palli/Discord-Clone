import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Server from '@/lib/models/Server';
import User from '@/lib/models/User';
import connectToDatabase from '@/lib/db';

export async function POST(req: NextRequest) {
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
      console.log('JWT Session Payload (accept-invite):', session);
    } catch (error) {
      return new NextResponse("Unauthorized: Invalid token", { status: 401 });
    }

    if (!session?.id) {
      return new NextResponse("Unauthorized: User ID not found in token", { status: 401 });
    }

    const requestBody = await req.json();
    console.log('Accept Invitation Request Body:', requestBody);
    const { serverId, invitationId } = requestBody;

    if (!serverId || !invitationId) {
      return new NextResponse("Server ID and Invitation ID are required", { status: 400 });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    const invitationIndex = server.invitations.findIndex(
      (inv: any) => inv._id.toString() === invitationId && inv.status === 'pending' && inv.email === session.email
    );

    if (invitationIndex === -1) {
      return new NextResponse("Invitation not found or already accepted/declined", { status: 404 });
    }

    // Check if the user is already a member
    if (server.members.includes(session.id)) {
      // If already a member, mark invitation as accepted and return success.
      // This handles cases where user might have been added by other means or re-accepts.
      server.invitations[invitationIndex].status = 'accepted';
      await server.save();
      return NextResponse.json({ message: "You are already a member of this server. Invitation marked as accepted." }, { status: 200 });
    }

    // Add user to server members
    server.members.push(session.id);
    server.invitations[invitationIndex].status = 'accepted';
    await server.save();

    return NextResponse.json({ message: "Invitation accepted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 