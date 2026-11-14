"use client"

import { useState } from "react"
import { ChevronDown, Hash, Volume2, Plus, Users, Settings, UserPlus, Bell, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import AddChannelModal from "./add-channel-modal"
import AddUserModal from "./add-user-modal"
import { useRouter, useSearchParams } from 'next/navigation';

interface TextChannel {
  _id: string;
  name: string;
}

interface VoiceChannel {
  _id: string;
  name: string;
  users?: number;
  userLimit?: number | null;
}

interface ChannelSidebarProps {
  serverId?: string;
  serverName?: string;
  textChannels?: TextChannel[];
  voiceChannels?: VoiceChannel[];
  selectedChannelId?: string;
}

export default function ChannelSidebar({ serverId, serverName, textChannels = [], voiceChannels = [], selectedChannelId }: ChannelSidebarProps) {
  const [textExpanded, setTextExpanded] = useState(true)
  const [voiceExpanded, setVoiceExpanded] = useState(true)
  const [addChannelModalOpen, setAddChannelModalOpen] = useState(false)
  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [channelTypeToAdd, setChannelTypeToAdd] = useState<"text" | "voice" | null>(null);
  const [serverRequiredFor, setServerRequiredFor] = useState<"text" | "voice" | null>(null);
  const [inviteServerRequired, setInviteServerRequired] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAddChannelClick = (type: "text" | "voice") => {
    if (!serverId) {
      setServerRequiredFor(type);
      return;
    }
    setServerRequiredFor(null);
    setChannelTypeToAdd(type);
    setAddChannelModalOpen(true);
  };

  const handleChannelAdded = () => {
    console.log("Channel added, refreshing channel list (ideally).");
    setAddChannelModalOpen(false);
    // A more robust solution would involve revalidating path or refetching server data
    // For now, assume the parent component handles a refresh after a channel is added.
  };

  const handleChannelClick = (channelId: string) => {
    const currentPath = `/servers/${serverId}`;
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('channelId', channelId);
    router.push(`${currentPath}?${newSearchParams.toString()}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Server Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900/50 shadow-lg bg-gray-800 relative">
        <h1 className="font-semibold text-white text-base">{serverName ?? "Home"}</h1>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Pin className="w-4 h-4" />
          </Button>
          <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
            {serverId ? (
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-gray-400 hover:text-white"
                aria-label="Invite User to Server"
                onClick={() => setInviteServerRequired(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
            {serverId && <AddUserModal isOpen={addUserModalOpen} onOpenChange={setAddUserModalOpen} serverId={serverId} />}
          </Dialog>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {serverRequiredFor && (
          <div role="alert" className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Create a server first to add a {serverRequiredFor} channel.
          </div>
        )}
        {inviteServerRequired && (
          <div role="alert" className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Create a server first to invite a user.
          </div>
        )}
        {/* Text Channels */}
        <div className="mb-6">
          <div
            className="w-full flex justify-start px-2 py-1 h-auto text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide group items-center cursor-pointer"
            onClick={() => setTextExpanded(!textExpanded)}
          >
            <ChevronDown
              className={`w-3 h-3 mr-1 transition-transform duration-200 ${textExpanded ? "" : "-rotate-90"}`}
            />
            Text Channels
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); 
                handleAddChannelClick("text");
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {textExpanded && (
            <div className="mt-1 space-y-0.5">
              {(textChannels || []).map((channel) => (
                <Button
                  key={channel._id || channel.name} // Use _id if available, fallback to name
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChannelClick(channel._id)}
                  className={`w-full justify-start px-2 py-1.5 h-auto text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded channel-item group ${selectedChannelId === channel._id ? "bg-gray-700/60 text-white active" : ""}`}
                >
                  <Hash className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {false && <div className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                    <button type="button" aria-label={`Invite user to ${channel.name}`} title="Invite user" className="hover:text-white" onClick={(event) => { event.stopPropagation(); setAddUserModalOpen(true); }}>
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Channels */}
        <div>
          <div
            className="w-full flex justify-start px-2 py-1 h-auto text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wide group items-center cursor-pointer"
            onClick={() => setVoiceExpanded(!voiceExpanded)}
          >
            <ChevronDown
              className={`w-3 h-3 mr-1 transition-transform duration-200 ${voiceExpanded ? "" : "-rotate-90"}`}
            />
            Voice Channels
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation(); 
                handleAddChannelClick("voice");
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {voiceExpanded && (
            <div className="mt-1 space-y-0.5">
              {(voiceChannels || []).map((channel) => (
                <div key={channel._id || channel.name} className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleChannelClick(channel._id)}
                    className={`w-full justify-start px-2 py-1.5 h-auto text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 rounded channel-item group ${selectedChannelId === channel._id ? "bg-gray-700/60 text-white active" : ""}`}
                  >
                    <Volume2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate flex-1">{channel.name}</span>
                    <div className="flex items-center space-x-1 text-xs">
                      {channel.users && channel.users > 0 && (
                        <>
                          <Users className="w-3 h-3" />
                          <span>
                            {channel.users}
                            {channel.userLimit ? `/${channel.userLimit}` : ""}
                          </span>
                        </>
                      )}
                    </div>
                    <button type="button" aria-label={`Invite user to ${channel.name}`} title="Invite user" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-white" onClick={(event) => { event.stopPropagation(); setAddUserModalOpen(true); }}>
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </Button>

                  {/* Connected Users */}
                  {channel.users && channel.users > 0 && (
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
      <Dialog open={addChannelModalOpen} onOpenChange={setAddChannelModalOpen}>
        <AddChannelModal 
          isOpen={addChannelModalOpen} 
          onOpenChange={setAddChannelModalOpen} 
          onChannelAdded={handleChannelAdded}
          serverId={serverId}
          channelType={channelTypeToAdd}
        />
      </Dialog>
    </div>
  )
}
