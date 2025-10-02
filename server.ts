import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import connectToDatabase from "./lib/db";
import { verifyToken } from "./lib/auth";
import User from "./lib/models/User";
import Message from "./lib/models/Message";
import Server from "./lib/models/Server";

require('dotenv').config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  await connectToDatabase();
  console.log("MongoDB connected successfully from custom server");

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request", err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: "*", // TODO: Restrict this in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("New WebSocket connection:", socket.id);

    const token = socket.handshake.auth.token;
    if (!token) {
      console.log("Unauthorized WebSocket connection: No token provided");
      socket.disconnect(true);
      return;
    }

    try {
      const payload = await verifyToken(token);
      const userId = payload.id;

      const user = await User.findById(userId);
      if (!user) {
        console.log("Unauthorized WebSocket connection: User not found");
        socket.disconnect(true);
        return;
      }

      socket.data.user = user;
      console.log(
        `User ${user.username} (${user.id}) connected via WebSocket`
      );

      // Update user status to online when connected to WebSocket
      user.status = "online";
      await user.save();
      io.emit("userStatusUpdate", { userId: user.id, status: "online" });

      socket.on(
        "joinChannel",
        async ({ serverId, channelId }: { serverId: string; channelId: string }) => {
          console.log(`User ${user.username} joining channel ${channelId} on server ${serverId}`);
          socket.join(channelId); // Join a room for the channel
        }
      );

      socket.on(
        "sendMessage",
        async ({ serverId, channelId, content }: {
          serverId: string;
          channelId: string;
          content: string;
        }) => {
        if (!content || content.trim() === "") {
          socket.emit("errorMessage", "Message content cannot be empty.");
          return;
        }
        if (content.length > 2000) {
          socket.emit("errorMessage", "Message content too long.");
          return;
        }

        try {
          const server = await Server.findById(serverId);
          if (!server) {
            socket.emit("errorMessage", "Server not found.");
            return;
          }

          // Check if user is a member of the server
          if (!server.members.includes(user._id)) {
            socket.emit("errorMessage", "You are not a member of this server.");
            return;
          }

          // Check if channel exists within the server
          const channelExists = server.textChannels.some(c => c._id.toString() === channelId);
          if (!channelExists) {
            socket.emit("errorMessage", "Channel not found in this server.");
            return;
          }

          const newMessage = await Message.create({
            sender: user._id,
            server: serverId,
            channel: channelId,
            content,
          });

          const populatedMessage = await newMessage.populate('sender', 'username avatarUrl');

          io.to(channelId).emit("message", populatedMessage); // Broadcast to channel room
          console.log(
            `Message sent to channel ${channelId} by ${user.username}: ${content}`
          );
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("errorMessage", "Failed to send message.");
        }
      });

      socket.on("disconnect", async () => {
        console.log(
          `User ${socket.data.user.username} (${socket.data.user.id}) disconnected`
        );
        // Optional: Update user status to offline if no other connections
        const remainingConnections = Array.from(io.sockets.sockets.values()).filter(
          (s) => s.data.user && s.data.user.id === socket.data.user.id
        );
        if (remainingConnections.length === 0) {
          socket.data.user.status = "offline";
          await socket.data.user.save();
          io.emit("userStatusUpdate", { userId: socket.data.user.id, status: "offline" });
        }
      });
    } catch (error) {
      console.log("WebSocket authentication failed:", error);
      socket.disconnect(true);
    }
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
