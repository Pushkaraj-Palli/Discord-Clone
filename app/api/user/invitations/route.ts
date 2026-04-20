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

    const userEmail = (session as any).email?.trim().toLowerCase();
    console.log('[DIAGNOSTIC] Fetching invitations for user email:', userEmail);

    const invitations = await Server.find({
      invitations: { 
        $elemMatch: { 
          email: userEmail, 
          status: "pending" 
        } 
      }
    }, 'name invitations');

    console.log(`[DIAGNOSTIC] Found ${invitations.length} servers with potential matches`);
    
    const formattedInvitations = invitations.map(server => {
      console.log(`[DIAGNOSTIC] processing server: ${server.name}`);
      const pendingForUser = server.invitations.filter(
        (inv: any) => {
          const emailMatch = inv.email === userEmail;
          const statusMatch = inv.status === 'pending';
          console.log(`  [DIAGNOSTIC] Checking inv: email=${inv.email} status=${inv.status} -> match=${emailMatch && statusMatch}`);
          return emailMatch && statusMatch;
        }
      );
      return pendingForUser.map((inv: any) => ({
        serverId: server._id,
        serverName: server.name,
        invitationId: inv._id,
        invitedBy: inv.invitedBy,
        createdAt: inv.createdAt,
      }));
    }).flat();

    console.log('[DIAGNOSTIC] Final Invitation Count:', formattedInvitations.length);
    console.log('Formatted Invitations Sent to Client:', formattedInvitations);

    return NextResponse.json({ invitations: formattedInvitations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 