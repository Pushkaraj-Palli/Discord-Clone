"use client"

import type React from "react"
import { useState } from "react"
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

export default function ChatArea({ serverName }: { serverName: string }) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
      setIsTyping(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setIsTyping(e.target.value.length > 0)
  }

  return (
    <div className="flex flex-col h-full bg-gray-750">
      {/* Chat Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-900/50 shadow-lg bg-gray-800 relative">
        <div className="flex items-center">
          <Hash className="w-5 h-5 text-gray-400 mr-2" />
          <span className="font-semibold text-white text-base">{serverName} - general</span>
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
      <ScrollArea className="flex-1 bg-gray-750">
        <MessageList />
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
              placeholder="Message #general"
              className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-400 px-3 py-3 text-sm"
              maxLength={2000}
            />

            <div className="flex items-center mr-3 space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
              >
                <Gift className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
              >
                <Sticker className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white w-8 h-8 discord-button"
              >
                <Smile className="w-5 h-5" />
              </Button>
              {message.trim() && (
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="text-indigo-400 hover:text-indigo-300 w-8 h-8 discord-button"
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
  )
}
