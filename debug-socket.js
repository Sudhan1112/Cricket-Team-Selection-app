const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3002';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  ROOM_UPDATED: 'room-updated',
  ERROR: 'error'
};

console.log('🔌 Connecting to server...');
const socket = io(SOCKET_URL);

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);
  
  // Test room creation
  const roomId = 'TEST123';
  const userName = 'TestUser';
  const userId = socket.id;
  
  console.log('📤 Sending JOIN_ROOM event:', { roomId, userId, userName });
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userId, userName });
});

socket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
  console.log('✅ ROOM_JOINED received:', data);
});

socket.on(SOCKET_EVENTS.ERROR, (error) => {
  console.log('❌ ERROR received:', error);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error);
});

// Keep the script running
setTimeout(() => {
  console.log('🛑 Test completed');
  socket.disconnect();
  process.exit(0);
}, 5000);
