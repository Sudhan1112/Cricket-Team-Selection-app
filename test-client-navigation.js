const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3002';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  ROOM_UPDATED: 'room-updated',
  ERROR: 'error'
};

console.log('🧪 Testing client navigation fix...');
console.log('🔌 Connecting to server...');

const socket = io(SOCKET_URL);

socket.on('connect', () => {
  console.log('✅ Connected to server with ID:', socket.id);
  
  // Simulate what the client does
  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const userName = 'TestUser';
  const userId = socket.id;
  
  console.log('📤 Creating room:', roomId);
  socket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userId, userName });
});

socket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
  console.log('✅ ROOM_JOINED received - Navigation should trigger now');
  console.log('📊 Room data:', {
    roomId: data.room.id,
    hostId: data.room.hostId,
    status: data.room.status,
    userCount: data.room.users.length
  });
  
  // Test joining another user
  console.log('👥 Testing second user join...');
  const socket2 = io(SOCKET_URL);
  
  socket2.on('connect', () => {
    console.log('✅ Second user connected:', socket2.id);
    socket2.emit(SOCKET_EVENTS.JOIN_ROOM, { 
      roomId: data.room.id, 
      userId: socket2.id, 
      userName: 'TestUser2' 
    });
  });
  
  socket2.on(SOCKET_EVENTS.ROOM_JOINED, (data2) => {
    console.log('✅ Second user joined successfully');
    console.log('🎉 Navigation test completed successfully!');
    
    socket.disconnect();
    socket2.disconnect();
    process.exit(0);
  });
  
  socket2.on(SOCKET_EVENTS.ERROR, (error) => {
    console.log('❌ Second user error:', error);
    socket.disconnect();
    socket2.disconnect();
    process.exit(1);
  });
});

socket.on(SOCKET_EVENTS.ERROR, (error) => {
  console.log('❌ ERROR received:', error);
  socket.disconnect();
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error);
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout - something went wrong');
  socket.disconnect();
  process.exit(1);
}, 10000);
