const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3002';

console.log('🧪 Testing simple Socket.IO connection...');

const socket = io(SOCKET_URL, { 
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Test basic connection
  setTimeout(() => {
    console.log('✅ Connection test successful');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 10000);
