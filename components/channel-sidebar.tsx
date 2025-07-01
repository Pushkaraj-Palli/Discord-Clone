"use client"

import { useState } from "react"
import { ChevronDown, Hash, Volume2, Plus, Users, Settings, UserPlus, Bell, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"

const textChannels = [
  { id: "1", name: "general", active: true, hasNotification: false },
  { id: "2", name: "random", active: false, hasNotification: true },
  { id: "3", name: "memes", active: false, hasNotification: false },
  { id: "4", name: "announcements", active: false, hasNotification: false },
  { id: "5", name: "development", active: false, hasNotification: true },
]

const voiceChannels = [
  { id: "1", name: "General", users: 3, userLimit: null },
  { id: "2", name: "Gaming", users: 0, userLimit: 10 },
  { id: "3", name: "Music", users: 1, userLimit: 5 },
  { id: "4", name: "Study Room", users: 2, userLimit: 4 },
]

export default function ChannelSidebar({ serverId }: { serverId: string }) {
  const [textExpanded, setTextExpanded] = useState(true)
  const [voiceExpanded, setVoiceExpanded] = useState(true)

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900/50 shadow-lg bg-gray-800 relative">
        <h1 className="font-semibold text-white text-base">Server: {serverId}</h1>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Pin className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <UserPlus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Text Channels */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2 py-1 h-auto text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide group"
            onClick={() => setTextExpanded(!textExpanded)}
          >
            <ChevronDown
              className={`w-3 h-3 mr-1 transition-transform duration-200 ${textExpanded ? "" : "-rotate-90"}`}
            />
            Text Channels
            <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Button>

          {textExpanded && (
            <div className="mt-1 space-y-0.5">
              {textChannels.map((channel) => (
                <Button
                  key={channel.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start px-2 py-1.5 h-auto text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded channel-item group ${
                    channel.active ? "bg-gray-700/60 text-white active" : ""
                  }`}
                >
                  <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {channel.hasNotification && <div className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                    <UserPlus className="w-4 h-4" />
                    <Settings className="w-4 h-4" />
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Channels */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-2 py-1 h-auto text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide group"
            onClick={() => setVoiceExpanded(!voiceExpanded)}
          >
            <ChevronDown
              className={`w-3 h-3 mr-1 transition-transform duration-200 ${voiceExpanded ? "" : "-rotate-90"}`}
            />
            Voice Channels
            <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Button>

          {voiceExpanded && (
            <div className="mt-1 space-y-0.5">
              {voiceChannels.map((channel) => (
                <div key={channel.id} className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start px-2 py-1.5 h-auto text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded channel-item group"
                  >
                    <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1">{channel.name}</span>
                    <div className="flex items-center space-x-1 text-xs">
                      {channel.users > 0 && (
                        <>
                          <Users className="w-3 h-3" />
                          <span>
                            {channel.users}
                            {channel.userLimit ? `/${channel.userLimit}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                      <UserPlus className="w-4 h-4" />
                      <Settings className="w-4 h-4" />
                    </div>
                  </Button>

                  {/* Connected Users */}
                  {channel.users > 0 && (
                    <div className="ml-6 space-y-1">
                      {Array.from({ length: channel.users }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-700/30 rounded cursor-pointer"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full status-online" />
                          <span>User {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
