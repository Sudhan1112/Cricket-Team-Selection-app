const io = require('socket.io-client');

const socket = io('http://localhost:3002', {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  
  // Try to join a room
  console.log('🚪 Attempting to join room...');
  socket.emit('join-room', {
    roomId: 'TEST123',
    userId: socket.id,
    userName: 'Test User'
  });
});

socket.on('room-joined', (data) => {
  console.log('✅ Room joined:', data);
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
  socket.disconnect();
  process.exit(1);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);
