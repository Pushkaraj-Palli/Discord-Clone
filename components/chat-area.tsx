"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  Hash,
  Users,
  Search,
  Inbox,
  MessageCircleQuestionIcon as QuestionMarkCircle,
  Plus,
  Gift,
  Sticker,
  Smile,
  Send,
  Paperclip,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import MessageList from "@/components/message-list"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSocket } from "@/hooks/use-socket";
import { IMessage } from "@/lib/models/Message";
import { useEffect, useRef } from "react";

interface ChatAreaProps {
  serverName: string;
  serverId: string;
  channelId?: string;
}

export default function ChatArea({ serverName, serverId, channelId }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const onMessage = useCallback((newMessage: IMessage) => {
    if (newMessage.channel.toString() === channelId) {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }
  }, [channelId]);

  const onUserStatusUpdate = useCallback((data: { userId: string; status: string }) => {
    console.log("User status updated:", data);
    // Implement logic to update user statuses in the UI if needed
  }, []);

  const onError = useCallback((errorMessage: string) => {
    console.error("WebSocket error in ChatArea:", errorMessage);
    // Display error to the user
  }, []);

  const { isConnected, sendMessage, joinChannel, error } = useSocket({
    onMessage,
    onUserStatusUpdate,
    onError
  });

  const fetchMessages = useCallback(async () => {
    if (!channelId || !serverId) return;
    try {
      const res = await fetch(`/api/servers/${serverId}/channels/${channelId}/messages`);
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching historical messages:", err);
      setMessages([]);
    }
  }, [channelId, serverId]);

  // Clear messages immediately when channel changes
  useEffect(() => {
    if (channelId) {
      console.log(`Channel changed to ${channelId}, clearing messages`);
      setMessages([]);
    }
  }, [channelId]);

  // Handle socket connection and message fetching
  useEffect(() => {
    if (channelId && serverId) {
      console.log(`Fetching messages for channel ${channelId} on server ${serverId}`);
      fetchMessages(); // Always fetch messages when channel or server changes
      
      if (isConnected) {
        console.log(`Joining channel ${channelId} via socket`);
        joinChannel(serverId, channelId);
      }
    }
  }, [channelId, serverId, fetchMessages, isConnected, joinChannel]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !serverId || !channelId) {
      console.warn("Cannot send message: Missing required fields.");
      return;
    }

    try {
      // Try Socket.IO first if connected
      if (isConnected) {
        sendMessage(serverId, channelId, message);
        setMessage("");
        setIsTyping(false);
        return;
      }

      // Fallback to HTTP API for Vercel deployment
      const response = await fetch(`/api/servers/${serverId}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message })
      });

      if (response.ok) {
        const newMessage = await response.json();
        // Add the message to local state immediately for better UX
        setMessages(prev => [...prev, newMessage]);
        setMessage("");
        setIsTyping(false);
        console.log('Message sent via HTTP API');
      } else {
        console.error('Failed to send message:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Find the current channel name based on channelId and server textChannels
  const currentChannelName = serverName; // Fallback, will be replaced with actual channel name

  return (
    <div className="flex flex-col h-full bg-gray-750">
      {/* Chat Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900/50 shadow-lg bg-gray-800 relative">
        <div className="flex items-center">
          <Hash className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-semibold text-white text-base">{serverName} - {currentChannelName}</span>
          <div className="ml-2 h-4 w-px bg-gray-600" />
          <span className="ml-2 text-sm text-gray-400">General discussion for everyone</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8">
            <Users className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8">
            <Inbox className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-700 w-8 h-8">
            <QuestionMarkCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={chatAreaRef} className="flex-1 bg-gray-750">
        <MessageList messages={messages} />
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-gray-750">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-center bg-gray-700 rounded-lg border border-gray-600 focus-within:border-gray-500 transition-colors duration-200">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-3 text-gray-400 hover:text-white w-8 h-8 discord-button"
            >
              <Plus className="w-5 h-5" />
            </Button>

            <Input
              value={message}
              onChange={handleInputChange}
              placeholder={channelId ? `Message #${currentChannelName}` : "Select a channel to message"}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-400 px-3 py-3 text-sm"
              maxLength={2000}
              disabled={!channelId}
              autoFocus={!!channelId}
            />

            <div className="flex items-center mr-3 space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
                disabled={!channelId}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
                disabled={!channelId}
              >
                <Gift className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
                disabled={!channelId}
              >
                <Sticker className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
                disabled={!channelId}
              >
                <Smile className="w-5 h-5" />
              </Button>
              {message.trim() && (
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-indigo-400 hover:text-indigo-300 w-8 h-8 discord-button"
                  disabled={!channelId}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Character count */}
          <div className="flex justify-between items-center mt-2 px-2">
            <div className="text-xs text-gray-500">{isTyping && "Press Enter to send, Shift+Enter for new line"}</div>
            <div className="text-xs text-gray-500">{message.length}/2000</div>
          </div>
        </form>
      </div>
    </div>
  );
}
