const express = require('express');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// CORS configuration for production
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'https://your-app-name.vercel.app', // Replace with your actual Vercel domain
];

// Initialize Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Socket.IO server is running', timestamp: new Date().toISOString() });
});

// MongoDB Schemas (simplified for server deployment)
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

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('New WebSocket connection:', socket.id);

  const token = socket.handshake.auth.token;
  if (!token) {
    console.log('Unauthorized WebSocket connection: No token provided');
    socket.disconnect(true);
    return;
  }

  try {
    const payload = await verifyToken(token);
    const userId = payload.id;

    const user = await User.findById(userId);
    if (!user) {
      console.log('Unauthorized WebSocket connection: User not found');
      socket.disconnect(true);
      return;
    }

    socket.data.user = user;
    console.log(`User ${user.username} (${user.id}) connected via WebSocket`);

    // Update user status to online when connected to WebSocket
    user.status = 'online';
    await user.save();
    io.emit('userStatusUpdate', { userId: user.id, status: 'online' });

    socket.on('joinChannel', async ({ serverId, channelId }) => {
      console.log(`User ${user.username} joining channel ${channelId} on server ${serverId}`);
      socket.join(channelId); // Join a room for the channel
    });

    socket.on('sendMessage', async ({ serverId, channelId, content }) => {
      if (!content || content.trim() === '') {
        socket.emit('errorMessage', 'Message content cannot be empty.');
        return;
      }
      if (content.length > 2000) {
        socket.emit('errorMessage', 'Message content too long.');
        return;
      }

      try {
        const server = await Server.findById(serverId);
        if (!server) {
          socket.emit('errorMessage', 'Server not found.');
          return;
        }

        // Check if user is a member of the server
        if (!server.members.includes(user._id)) {
          socket.emit('errorMessage', 'You are not a member of this server.');
          return;
        }

        // Check if channel exists within the server
        const channelExists = server.textChannels.some(c => c._id.toString() === channelId);
        if (!channelExists) {
          socket.emit('errorMessage', 'Channel not found in this server.');
          return;
        }

        const newMessage = await Message.create({
          sender: user._id,
          server: serverId,
          channel: channelId,
          content,
        });

        const populatedMessage = await newMessage.populate('sender', 'username avatarUrl');

        io.to(channelId).emit('message', populatedMessage); // Broadcast to channel room
        console.log(`Message sent to channel ${channelId} by ${user.username}: ${content}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('errorMessage', 'Failed to send message.');
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User ${socket.data.user.username} (${socket.data.user.id}) disconnected`);
      // Optional: Update user status to offline if no other connections
      const remainingConnections = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.data.user && s.data.user.id === socket.data.user.id
      );
      if (remainingConnections.length === 0) {
        socket.data.user.status = 'offline';
        await socket.data.user.save();
        io.emit('userStatusUpdate', { userId: socket.data.user.id, status: 'offline' });
      }
    });
  } catch (error) {
    console.log('WebSocket authentication failed:', error);
    socket.disconnect(true);
  }
});

// Start the server
const PORT = process.env.PORT || 3001;

connectToDatabase().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
  });
});