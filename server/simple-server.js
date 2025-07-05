// Simple server without complex dependencies
console.log('🚀 Starting simple server...');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = createServer(app);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Basic middleware
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple in-memory room storage
const rooms = new Map();
const userRooms = new Map();

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  socket.on('join-room', async (data) => {
    try {
      console.log('📥 join-room event received:', data);
      const { roomId, userId, userName } = data;

      if (!userId || !userName) {
        console.log('❌ Missing required fields:', { roomId, userId, userName });
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      let room;
      
      if (!roomId) {
        // Create new room
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        room = {
          id: newRoomId,
          hostId: userId,
          status: 'waiting',
          users: new Map(),
          createdAt: new Date()
        };
        rooms.set(newRoomId, room);
        console.log(`🏗️ Created new room: ${newRoomId}`);
      } else {
        // Join existing room
        room = rooms.get(roomId);
        if (!room) {
          console.log('❌ Room not found:', roomId);
          socket.emit('error', { message: 'Room not found' });
          return;
        }
      }

      // Add user to room
      const user = {
        id: userId,
        name: userName,
        isHost: room.hostId === userId,
        selectedPlayers: [],
        isConnected: true
      };
      
      room.users.set(userId, user);
      userRooms.set(userId, room.id);
      
      // Join socket room
      socket.join(room.id);
      socket.roomId = room.id;
      socket.userId = userId;

      // Prepare response data
      const roomData = {
        room: {
          id: room.id,
          hostId: room.hostId,
          status: room.status,
          users: Array.from(room.users.values()),
          createdAt: room.createdAt
        },
        user: user
      };

      console.log('📤 Sending room-joined response:', roomData);
      socket.emit('room-joined', roomData);

      // Notify other users in the room
      socket.to(room.id).emit('user-joined', { user });

      console.log(`User ${userName} (${userId}) joined room ${room.id}`);
    } catch (error) {
      console.error('❌ join-room error:', error.message);
      socket.emit('error', { message: error.message });
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
    
    if (socket.roomId && socket.userId) {
      const room = rooms.get(socket.roomId);
      if (room && room.users.has(socket.userId)) {
        room.users.delete(socket.userId);
        userRooms.delete(socket.userId);
        
        // Notify other users
        socket.to(socket.roomId).emit('user-left', { userId: socket.userId });
        
        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
          console.log(`🗑️ Cleaned up empty room: ${socket.roomId}`);
        }
      }
    }
  });
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Simple server live at http://localhost:${PORT}`);
});
