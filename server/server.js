// server.js
console.log('🚀 Starting server...');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
console.log('✅ Dependencies loaded');

console.log('📡 Loading Redis client...');
const redisClient = require('./config/redis');
console.log('📡 Loading room routes...');
const roomRoutes = require('./routes/roomRoutes');
console.log('📡 Loading socket controller...');
const { socketHandler } = require('./controllers/socketController');
console.log('✅ All modules loaded');

const app = express();
const server = createServer(app);

// 1️⃣ Define all allowed origins here
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

// 2️⃣ Apply the same CORS settings for both REST and WebSocket
app.use(cors({
  origin(origin, callback) {
    // allow requests with no origin (e.g. mobile or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed: ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// 3️⃣ Socket.IO server config
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Socket.IO CORS error: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 4️⃣ Routes & health check
app.use('/api/rooms', roomRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 5️⃣ Wire up Socket.IO
io.on('connection', socket => {
  console.log(`✅ User connected: ${socket.id}`);
  try {
    socketHandler(socket, io);
  } catch (error) {
    console.error('❌ Socket handler error:', error);
  }
});

// 6️⃣ Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// 7️⃣ Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...');
  await redisClient.disconnect();
  server.close(() => process.exit(0));
});

// 8️⃣ Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Backend live at http://localhost:${PORT}`);
});
