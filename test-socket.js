const io = require('socket.io-client');
const http = require('http');

const SOCKET_URL = 'http://localhost:3002';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  ERROR: 'error'
};

async function testRoomCreation() {
  console.log('🔌 Connecting to Socket.IO server...');
  
  const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', async () => {
    console.log('✅ Connected to server:', socket.id);
    
    try {
      // Step 1: Create room via API
      console.log('📡 Creating room via API...');

      const postData = JSON.stringify({
        hostId: socket.id,
        hostName: 'Test User'
      });

      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/rooms/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const data = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(e);
            }
          });
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log('📦 Room creation response:', data);

      if (!data.success) {
        throw new Error(data.message);
      }

      const roomId = data.data.roomId;
      console.log('🎉 Room created:', roomId);

      // Step 2: Join room via Socket.IO
      console.log('📤 Joining room via Socket.IO...');
      
      socket.on(SOCKET_EVENTS.ROOM_JOINED, (roomData) => {
        console.log('🎉 ROOM_JOINED event received:', roomData);
        console.log('✅ Test completed successfully!');
        socket.disconnect();
        process.exit(0);
      });

      socket.on(SOCKET_EVENTS.ERROR, (error) => {
        console.error('❌ Socket error:', error);
        socket.disconnect();
        process.exit(1);
      });

      socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        roomId,
        userId: socket.id,
        userName: 'Test User'
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        console.error('⏰ Test timeout - no ROOM_JOINED event received');
        socket.disconnect();
        process.exit(1);
      }, 10000);

    } catch (error) {
      console.error('❌ Test error:', error);
      socket.disconnect();
      process.exit(1);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('🔥 Connection error:', error);
    process.exit(1);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });
}

testRoomCreation();
