const io = require('socket.io-client');
const http = require('http');

const SOCKET_URL = 'http://localhost:3002';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  ROOM_UPDATED: 'room-updated',
  START_SELECTION: 'start-selection',
  SELECTION_STARTED: 'selection-started',
  ERROR: 'error'
};

async function createRoom(hostId, hostName) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      hostId: hostId,
      hostName: hostName
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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000);
    req.write(postData);
    req.end();
  });
}

async function testRoomFlow() {
  console.log('🧪 Testing Room Flow...');
  
  // Create host socket
  const hostSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  
  let roomId = null;
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout'));
    }, 20000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      hostSocket.disconnect();
    };
    
    // Host socket events
    hostSocket.on('connect', async () => {
      console.log('✅ Host connected:', hostSocket.id);
      
      try {
        // Create room
        console.log('📡 Creating room...');
        const response = await createRoom(hostSocket.id, 'Host User');
        roomId = response.data.roomId;
        console.log('🏠 Room created:', roomId);
        
        // Join room as host
        console.log('🚪 Host joining room...');
        hostSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          roomId: roomId,
          userId: hostSocket.id,
          userName: 'Host User'
        });
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Host joined room successfully');
      console.log('👥 Users in room:', data.room.users?.length);
      console.log('👥 User details:', data.room.users?.map(u => ({ id: u.id, name: u.name })));
      console.log('🏠 Host ID:', data.room.hostId);
      console.log('🏠 Is host?', data.userId === data.room.hostId);
      
      // Test completed successfully
      cleanup();
      resolve({
        success: true,
        roomId,
        usersCount: data.room.users?.length,
        hostId: data.room.hostId,
        isHost: data.userId === data.room.hostId
      });
    });
    
    hostSocket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('👥 HOST received USER_JOINED event:', data.user?.name);
      console.log('👥 Room users count (USER_JOINED):', data.room?.users?.length);
    });
    
    hostSocket.on(SOCKET_EVENTS.ROOM_UPDATED, (data) => {
      console.log('🔄 HOST received ROOM_UPDATED event');
      console.log('🔄 Room users count (ROOM_UPDATED):', data.room?.users?.length);
    });
    
    hostSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Host socket error:', error);
      cleanup();
      reject(new Error(`Host error: ${error.message}`));
    });
    
    hostSocket.on('connect_error', (error) => {
      console.error('❌ Host connection error:', error);
      cleanup();
      reject(error);
    });
  });
}

// Run the test
testRoomFlow()
  .then(result => {
    console.log('✅ Room flow test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Room flow test failed:', error.message);
    process.exit(1);
  });
