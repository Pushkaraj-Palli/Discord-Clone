import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const onlineUsers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "online",
    activity: "Playing Valorant",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "online",
    activity: "Listening to Spotify",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "idle",
    activity: null,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "dnd",
    activity: "In a meeting",
  },
]

const offlineUsers = [
  {
    id: "5",
    name: "Alex Chen",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "offline",
    activity: null,
  },
  {
    id: "6",
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "offline",
    activity: null,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "idle":
      return "bg-yellow-500"
    case "dnd":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export default function UserList({ serverName }: { serverName: string }) {
  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Online for {serverName} — {onlineUsers.length}
      </h3>

      <div className="space-y-2 mb-6">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700/50 cursor-pointer group"
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gray-600 text-white text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate">{user.name}</div>
              {user.activity && <div className="text-xs text-gray-400 truncate">{user.activity}</div>}
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Offline — {offlineUsers.length}
      </h3>

      <div className="space-y-2">
        {offlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700/50 cursor-pointer group opacity-50"
          >
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-gray-600 text-white text-sm">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-200 truncate">{user.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
