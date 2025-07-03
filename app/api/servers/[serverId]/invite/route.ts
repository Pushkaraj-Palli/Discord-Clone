import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import Server from '@/lib/models/Server';
import User from '@/lib/models/User';
import connectToDatabase from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { serverId: string } }) {
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

    // Await params here as the error suggests, even if unusual
    const awaitedParams = await Promise.resolve(params);
    const { serverId } = awaitedParams;
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Invitations are embedded subdocuments, no need to populate.
    const server = await Server.findById(serverId);

    if (!server) {
      return new NextResponse("Server not found", { status: 404 });
    }

    // Ensure invitations is an array. Mongoose will default it to [] from schema definition.
    if (!server.invitations) { // This check might still be useful for older documents or unexpected data
      server.invitations = [];
    }

    // Check if the inviting user is a member of the server
    if (!server.members.includes(session.id)) {
      return new NextResponse("You are not a member of this server.", { status: 403 });
    }

    // Check if the user is already a member
    const invitedUser = await User.findOne({ email });
    if (invitedUser && server.members.includes(invitedUser._id)) {
      return new NextResponse("User is already a member of this server.", { status: 409 });
    }

    // Check if an invitation already exists for this email
    const existingInvitation = server.invitations.find(
      (inv: any) => inv.email === email && inv.status === 'pending'
    );
    if (existingInvitation) {
      return new NextResponse("An invitation to this user already exists.", { status: 409 });
    }

    server.invitations.push({
      email,
      invitedBy: session.id,
      status: 'pending',
    });
    await server.save();

    return NextResponse.json({ message: "Invitation sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 