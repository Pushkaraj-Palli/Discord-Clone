"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Reply, Smile, Pin } from "lucide-react"

const messages = [
  {
    id: "1",
    user: {
      name: "John Doe",
      username: "johndoe",
      avatar: "/placeholder.svg?height=40&width=40",
      color: "#7289da",
      role: "Admin",
      isBot: false,
    },
    content: "Hey everyone! How's it going? 👋",
    timestamp: "2024-01-15T10:30:00Z",
    isSystem: false,
    reactions: [
      { emoji: "👋", count: 3, reacted: true },
      { emoji: "😊", count: 1, reacted: false },
    ],
    edited: false,
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      username: "janesmith",
      avatar: "/placeholder.svg?height=40&width=40",
      color: "#43b581",
      role: "Moderator",
      isBot: false,
    },
    content: "Pretty good! Just working on some new features for our app. Check out this cool design I made:",
    timestamp: "2024-01-15T10:32:00Z",
    isSystem: false,
    reactions: [
      { emoji: "🔥", count: 5, reacted: false },
      { emoji: "💯", count: 2, reacted: true },
    ],
    edited: true,
  },
  {
    id: "3",
    user: {
      name: "Discord Bot",
      username: "discordbot",
      avatar: "/placeholder.svg?height=40&width=40",
      color: "#7289da",
      role: "Bot",
      isBot: true,
    },
    content: "🎉 **Welcome to the server!** Make sure to read the rules in <#rules> and introduce yourself!",
    timestamp: "2024-01-15T10:35:00Z",
    isSystem: false,
    reactions: [],
    edited: false,
  },
  {
    id: "4",
    user: {
      name: "Mike Johnson",
      username: "mikej",
      avatar: "/placeholder.svg?height=40&width=40",
      color: "#faa61a",
      role: "Member",
      isBot: false,
    },
    content: "That sounds awesome @janesmith! What kind of features are you adding? 🤔",
    timestamp: "2024-01-15T10:37:00Z",
    isSystem: false,
    reactions: [{ emoji: "🤔", count: 1, reacted: false }],
    edited: false,
  },
  {
    id: "5",
    user: {
      name: "Sarah Wilson",
      username: "sarahw",
      avatar: "/placeholder.svg?height=40&width=40",
      color: "#f04747",
      role: "Member",
      isBot: false,
    },
    content: "I'm excited to see what you're building! 🚀\n\n```js\nconsole.log('This is so cool!');\n```",
    timestamp: "2024-01-15T10:40:00Z",
    isSystem: false,
    reactions: [
      { emoji: "🚀", count: 4, reacted: true },
      { emoji: "💻", count: 2, reacted: false },
    ],
    edited: false,
  },
]

export default function MessageList() {
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
      <div className="px-4 py-8 border-b border-gray-700/50">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome to #general!</h2>
        <p className="text-gray-400 text-center">This is the start of the #general channel.</p>
      </div>

      <div className="px-4 py-4 space-y-1">
        {messages.map((message, index) => {
          const showAvatar = index === 0 || messages[index - 1].user.name !== message.user.name
          const timeDiff =
            index > 0 ? new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() : 0
          const showTimestamp = showAvatar || timeDiff > 5 * 60 * 1000 // 5 minutes

          return (
            <div key={message.id} className="group hover:bg-gray-700/20 px-4 py-1 -mx-4 rounded message-hover relative">
              {showAvatar ? (
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10 mt-0.5">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                    <AvatarFallback style={{ backgroundColor: message.user.color }}>
                      {message.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span
                        className="font-medium text-sm hover:underline cursor-pointer"
                        style={{ color: message.user.color }}
                      >
                        {message.user.name}
                      </span>
                      {message.user.isBot && (
                        <span className="bg-indigo-500 text-white text-xs px-1 py-0.5 rounded font-medium">BOT</span>
                      )}
                      <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.edited && <span className="text-xs text-gray-500">(edited)</span>}
                    </div>
                    <div
                      className="text-gray-100 text-sm break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button key={idx} className={`reaction ${reaction.reacted ? "reacted" : ""}`}>
                            <span className="mr-1">{reaction.emoji}</span>
                            <span className="text-xs">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-10 flex justify-center">
                    {showTimestamp && (
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatTime(message.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-gray-100 text-sm break-words leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                    />
                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button key={idx} className={`reaction ${reaction.reacted ? "reacted" : ""}`}>
                            <span className="mr-1">{reaction.emoji}</span>
                            <span className="text-xs">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
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

        {/* Typing Indicator */}
        <div className="flex items-center space-x-3 px-4 py-2 opacity-75">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <div className="loading-dots">
              <div className="loading-dot typing-dot"></div>
              <div className="loading-dot typing-dot"></div>
              <div className="loading-dot typing-dot"></div>
            </div>
          </div>
          <span className="text-sm text-gray-400">
            <strong>Someone</strong> is typing...
          </span>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  )
}
