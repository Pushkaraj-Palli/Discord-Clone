import { notFound } from 'next/navigation';
import { Suspense } from "react"
import ServerList from "@/components/server-list"
import ChannelSidebar from "@/components/channel-sidebar"
import ChatArea from "@/components/chat-area"
import UserList from "@/components/user-list"
import UserPanel from "@/components/user-panel"
import LoadingSpinner from "@/components/loading-spinner"
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getServerDetails(serverId: string) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/servers/${serverId}`, {
    headers: {
      'Cookie': cookieStore.toString(),
    },
    cache: 'no-store', // Ensure data is always fresh
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch server details: ${res.statusText}`);
  }
  return res.json();
}

export default async function ServerPage({ params, searchParams }: { params: Promise<{ serverId: string }>, searchParams: Promise<{ channelId?: string }> }) {
  const { serverId } = await params;
  const { channelId } = await searchParams;

  console.log("ServerPage - params:", params);
  console.log("ServerPage - serverId:", serverId);
  console.log("ServerPage - channelId:", channelId);

  const server = await getServerDetails(serverId);

  // Redirect to the first text channel if no channelId is provided
  if (!channelId && server.textChannels && server.textChannels.length > 0) {
    redirect(`/servers/${serverId}?channelId=${server.textChannels[0]._id}`);
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-800 md:flex-row">
      {/* Server List */}
      <div className="h-14 w-full shrink-0 bg-gray-900 md:h-auto md:w-[72px]">
        <Suspense fallback={<LoadingSpinner />}>
          <ServerList />
        </Suspense>
      </div>

      {/* Channel Sidebar */}
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[38%] min-w-[132px] max-w-[240px] flex-col bg-gray-800 md:w-60 md:min-w-0 md:max-w-none">
          <Suspense fallback={<LoadingSpinner />}>
            <ChannelSidebar serverId={serverId} serverName={server.name} textChannels={server.textChannels} voiceChannels={server.voiceChannels} selectedChannelId={channelId} />
          </Suspense>
          <UserPanel />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<LoadingSpinner />}>
            <ChatArea serverName={server.name} serverId={serverId} channelId={channelId} />
          </Suspense>
        </div>
      </div>

      {/* User List - Hidden on mobile */}
      <div className="w-60 bg-gray-800 hidden lg:block">
        <Suspense fallback={<LoadingSpinner />}>
          <UserList serverName={server.name} />
        </Suspense>
      </div>
    </div>
  )
} 
