import { Suspense } from "react"
import ServerList from "@/components/server-list"
import ChannelSidebar from "@/components/channel-sidebar"
import ChatArea from "@/components/chat-area"
import UserList from "@/components/user-list"
import UserPanel from "@/components/user-panel"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-800">
      {/* Server List */}
      <div className="w-[72px] bg-gray-900 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <ServerList />
        </Suspense>
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-gray-800 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <ChannelSidebar />
        </Suspense>
        <UserPanel />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<LoadingSpinner />}>
          <ChatArea />
        </Suspense>
      </div>

      {/* User List - Hidden on mobile */}
      <div className="w-60 bg-gray-800 hidden lg:block">
        <Suspense fallback={<LoadingSpinner />}>
          <UserList />
        </Suspense>
      </div>
    </div>
  )
}
