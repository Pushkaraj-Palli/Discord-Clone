import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Server from '@/lib/models/Server';
import connectToDatabase from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const token = req.cookies.get('token')?.value;

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

    const { serverId, invitationId } = await req.json();

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

    server.invitations[invitationIndex].status = 'declined';
    await server.save();

    return NextResponse.json({ message: "Invitation declined successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 