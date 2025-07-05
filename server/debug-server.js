// Simple debug server to test socket connection
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

console.log('🚀 Starting debug server...');

const app = express();
const server = createServer(app);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  }
});

// Basic health endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);
  
  socket.on('join-room', (data) => {
    console.log('📥 join-room event received:', data);
    
    // Simple response for testing
    const roomData = {
      room: {
        id: 'test-room-123',
        hostId: data.userId,
        status: 'waiting',
        users: [{
          id: data.userId,
          name: data.userName,
          isHost: true,
          selectedPlayers: [],
          isConnected: true
        }]
      },
      user: {
        id: data.userId,
        name: data.userName,
        isHost: true,
        selectedPlayers: [],
        isConnected: true
      }
    };
    
    console.log('📤 Sending room-joined response:', roomData);
    socket.emit('room-joined', roomData);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`);
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
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Debug server live at http://localhost:${PORT}`);
});
