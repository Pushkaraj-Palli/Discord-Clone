'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCookie } from "cookies-next"
import { Suspense } from "react"
import ServerList from "@/components/server-list"
import ChannelSidebar from "@/components/channel-sidebar"
import ChatArea from "@/components/chat-area"
import UserList from "@/components/user-list"
import UserPanel from "@/components/user-panel"
import LoadingSpinner from "@/components/loading-spinner"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('auth_token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

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
          <Suspense fallback={<LoadingSpinner />}><ChannelSidebar /></Suspense>
          <UserPanel />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense fallback={<LoadingSpinner />}><ChatArea /></Suspense>
        </div>
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
