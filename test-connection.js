// Simple test to verify socket connection
const { io } = require('socket.io-client');

console.log('Testing socket connection to http://localhost:3001...');

const socket = io('http://localhost:3001', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  timeout: 20000
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!', socket.id);
  
  // Test room creation
  console.log('Testing room creation...');
  socket.emit('join-room', {
    roomId: null, // Create new room
    userId: socket.id,
    userName: 'TestUser'
  });
});

socket.on('room-joined', (data) => {
  console.log('✅ Room joined successfully:', data);
  process.exit(0);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Test timed out');
  process.exit(1);
}, 10000);
