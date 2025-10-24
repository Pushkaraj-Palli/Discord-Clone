"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Reply, Smile, Pin } from "lucide-react"
import { IMessage } from "@/lib/models/Message";

interface MessageListProps {
  messages: IMessage[];
}

export default function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/<#(\w+)>/g, '<span class="mention">#$1</span>')
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>')

    // Handle code blocks
    if (content.includes("```")) {
      formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="code-block">$2</div>')
    }

    return formatted
  }

  return (
    <div className="min-h-full">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="px-4 py-8 border-b border-gray-700/50">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome!</h2>
          <p className="text-gray-400 text-center">This is the start of this channel.</p>
        </div>
      )}

      <div className="px-4 py-4 space-y-1">
        {messages.map((message, index) => {
          const showAvatar = index === 0 || messages[index - 1].sender.username !== message.sender.username
          const timeDiff =
            index > 0 ? new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() : 0
          const showTimestamp = showAvatar || timeDiff > 5 * 60 * 1000 // 5 minutes

          return (
            <div key={message._id} className="group hover:bg-gray-700/20 px-4 py-1 -mx-4 rounded message-hover relative">
              {showAvatar ? (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 mt-0.5">
                    {message.sender.avatarUrl ? (
                      <AvatarImage src={message.sender.avatarUrl} alt={message.sender.username} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {message.sender.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span
                        className="font-medium text-sm hover:underline cursor-pointer"
                      >
                        {message.sender.username}
                      </span>
                      <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer">
                        {formatTime(message.timestamp.toString())}
                      </span>
                    </div>
                    <div
                      className="text-gray-100 text-sm break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-10 flex justify-center">
                    {showTimestamp && (
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(message.timestamp.toString())}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-gray-100 text-sm break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                  </div>
                </div>
              )}

              {/* Message Actions */}
              <div className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex items-center">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
                  <Reply className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
                  <Pin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
