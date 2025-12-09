const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config();

// Environment configuration
const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0"; // Bind to all interfaces for Render
const port = parseInt(process.env.PORT || "10000", 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Schemas (using the same structure as the existing models)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: '' },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
  channel: { type: mongoose.Schema.Types.ObjectId, required: true },
  content: { type: String, required: true, maxLength: 2000 },
}, { timestamps: true });

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  textChannels: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    topic: { type: String },
  }],
  voiceChannels: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Server = mongoose.model('Server', serverSchema);

// JWT verification function
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Database connection with retry logic
const connectToDatabase = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (retries > 0) {
      console.log(`Retrying database connection... (${retries} attempts left)`);
      setTimeout(() => connectToDatabase(retries - 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

// Graceful shutdown handler
const gracefulShutdown = (server, io) => {
  console.log('Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    console.log('HTTP server closed');
    
    io.close(() => {
      console.log('Socket.IO server closed');
      
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  });
};

// Main server initialization
app.prepare().then(async () => {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Create HTTP server
    const httpServer = createServer(async (req, res) => {
      try {
        // Health check endpoint
        if (req.url === '/health') {
          const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              nextjs: 'running',
              socketio: 'running',
              database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            }
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(healthStatus));
          return;
        }

        // Handle all other requests with Next.js
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal server error");
      }
    });

    // Initialize Socket.IO server with proper CORS for Render
    const allowedOrigins = [
      process.env.RENDER_EXTERNAL_URL, // Render's external URL
      `https://${process.env.RENDER_SERVICE_NAME}.onrender.com`, // Render service URL pattern
      'http://localhost:3000', // Local development
      'http://localhost:10000' // Local production testing
    ].filter(Boolean); // Remove undefined values

    const io = new SocketIOServer(httpServer, {
      path: "/api/socket.io",
      addTrailingSlash: false,
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (mobile apps, etc.)
          if (!origin) return callback(null, true);
          
          if (allowedOrigins.includes(origin) || dev) {
            callback(null, true);
          } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Socket.IO connection handling
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
        console.log(`User ${user.username} (${user.id}) connected via WebSocket`);

        // Update user status to online
        user.status = "online";
        await user.save();
        io.emit("userStatusUpdate", { userId: user.id, status: "online" });

        // Handle channel joining
        socket.on("joinChannel", async ({ serverId, channelId }) => {
          console.log(`User ${user.username} joining channel ${channelId} on server ${serverId}`);
          socket.join(channelId);
        });

        // Handle message sending
        socket.on("sendMessage", async ({ serverId, channelId, content }) => {
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
            io.to(channelId).emit("message", populatedMessage);
            console.log(`Message sent to channel ${channelId} by ${user.username}: ${content}`);
          } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("errorMessage", "Failed to send message.");
          }
        });

        // Handle disconnection
        socket.on("disconnect", async () => {
          console.log(`User ${socket.data.user.username} (${socket.data.user.id}) disconnected`);
          
          // Update user status to offline if no other connections
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

    // Start server
    httpServer.listen(port, hostname, () => {
      console.log(`> Server ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
      console.log(`> Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    });

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown(httpServer, io));
    process.on('SIGINT', () => gracefulShutdown(httpServer, io));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown(httpServer, io);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown(httpServer, io);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});