"use client"

import { useState } from "react"
import { Mic, MicOff, Headphones, HeadphonesIcon, Settings, PhoneOff } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import SettingsSidebar from "@/components/settings-sidebar"

export default function UserPanel() {
  const [isMuted, setIsMuted] = useState(false)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const currentUser = {
    name: "YourUsername",
    username: "user#1234",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "online",
    customStatus: "Building awesome apps",
  }

  return (
    <div className="h-14 bg-gray-900 px-2 flex items-center justify-between border-t border-gray-800">
      <div className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer hover:bg-gray-800 rounded p-1 transition-colors duration-200">
        <div className="relative">
          <Avatar className="w-8 h-8">
            <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
            <AvatarFallback className="bg-indigo-500 text-white text-sm font-medium">
              {currentUser.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 status-online" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
          <div className="text-xs text-gray-400 truncate">{currentUser.customStatus || currentUser.username}</div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {isInCall && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 discord-button"
            onClick={() => setIsInCall(!isInCall)}
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 discord-button ${
            isMuted
              ? "text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`w-8 h-8 discord-button ${
            isDeafened
              ? "text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/30"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
          onClick={() => setIsDeafened(!isDeafened)}
        >
          {isDeafened ? <HeadphonesIcon className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 text-gray-400 hover:text-white hover:bg-gray-700 discord-button"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      <SettingsSidebar isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  )
}
