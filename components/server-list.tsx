'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Hash, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import AddServerModal from "@/components/add-server-modal"

interface Server { 
  _id: string;
  name: string;
  icon: string | null;
  active: boolean;
  hasNotification: boolean;
}

export default function ServerList() {
  const [servers, setServers] = useState<Server[]>([])
  const [addServerModalOpen, setAddServerModalOpen] = useState(false)
  const router = useRouter()

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      if (response.ok) {
        const data = await response.json();
        setServers(data.map((server: any) => ({ ...server, active: false, hasNotification: false })));
      } else {
        console.error('Failed to fetch servers');
      }
    } catch (error) {
      console.error('Error fetching servers:', error);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleServerAdded = () => {
    fetchServers();
  };

  return (
    <div className="flex flex-col items-center py-3 space-y-2 bg-gray-900">
      {/* Discord Home Button */}
      <div className="relative group">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl group-hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer server-icon discord-glow">
          <Hash className="w-6 h-6 text-white" />
        </div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full transition-all duration-200" />
        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 discord-shadow tooltip">
          Direct Messages
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-8 h-0.5 bg-gray-600 rounded-full my-2" />

      {/* Server List */}
      {servers.map((server) => (
        <div key={server._id} className="relative group">
          <Link href={`/servers/${server._id}`}>
            <div
              className={`w-12 h-12 ${
                server.active
                  ? "bg-indigo-500 rounded-xl"
                  : "bg-gray-700 rounded-2xl group-hover:rounded-xl group-hover:bg-indigo-500"
              } transition-all duration-200 flex items-center justify-center cursor-pointer server-icon relative overflow-hidden`}
            >
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover rounded-2xl group-hover:rounded-xl" />
              ) : (
                <span className="text-xl relative z-10">{server.name.charAt(0)}</span>
              )}
              {server.hasNotification && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              )}
            </div>
          </Link>

          {/* Active indicator */}
          <div
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 bg-white rounded-r-full transition-all duration-200 ${
              server.active ? "h-8" : "h-0 group-hover:h-5"
            }`}
          />

          {/* Tooltip */}
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 discord-shadow tooltip">
            {server.name}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      ))}

      {/* Add Server Button */}
      <Dialog open={addServerModalOpen} onOpenChange={setAddServerModalOpen}>
        <DialogTrigger asChild>
          <div className="relative group">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-gray-700 hover:bg-green-600 rounded-2xl hover:rounded-xl transition-all duration-200 text-green-500 hover:text-white server-icon discord-button"
            >
              <Plus className="w-6 h-6" />
            </Button>
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 discord-shadow tooltip">
              Add a Server
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </DialogTrigger>
        <AddServerModal isOpen={addServerModalOpen} onOpenChange={setAddServerModalOpen} onServerAdded={handleServerAdded} />
      </Dialog>
    </div>
  )
}
