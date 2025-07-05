const io = require('socket.io-client');
const http = require('http');

const SOCKET_URL = 'http://localhost:3002';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
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

async function getRoomDetails(roomId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/api/rooms/${roomId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
    req.end();
  });
}

async function testRoomDetailsWithMultipleUsers() {
  console.log('🏠 Testing Room Details with Multiple Users...');
  
  // Create two socket connections
  const hostSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  const playerSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  
  let roomId = null;
  let hostJoined = false;
  let playerJoined = false;
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout'));
    }, 20000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      hostSocket.disconnect();
      playerSocket.disconnect();
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
    
    hostSocket.on(SOCKET_EVENTS.ROOM_JOINED, async (data) => {
      console.log('✅ Host joined room');
      console.log('👥 Users in room (from ROOM_JOINED):', data.room.users?.length || 0);
      hostJoined = true;

      // Test room details API after host joins
      try {
        const roomDetails = await getRoomDetails(roomId);
        console.log('📊 Room details after host joins:', {
          users: roomDetails.data.users,
          userCount: roomDetails.data.users?.length || 0
        });
      } catch (error) {
        console.error('❌ Error getting room details:', error);
      }

      // Now that host has joined, make player join
      if (playerSocket.connected) {
        console.log('🚪 Player joining room...');
        playerSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          roomId: roomId,
          userId: playerSocket.id,
          userName: 'Player User'
        });
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.USER_JOINED, async (data) => {
      console.log('👥 User joined event received:', data.userName);
      
      // Test room details API after second user joins
      try {
        const roomDetails = await getRoomDetails(roomId);
        console.log('📊 Room details after second user joins:', {
          users: roomDetails.data.users,
          userCount: roomDetails.data.users?.length || 0,
          canStart: roomDetails.data.users?.length >= 2
        });
        
        cleanup();
        resolve(roomDetails);
      } catch (error) {
        console.error('❌ Error getting room details:', error);
        cleanup();
        reject(error);
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Host socket error:', error);
      cleanup();
      reject(new Error(`Host error: ${error.message}`));
    });
    
    // Player socket events
    playerSocket.on('connect', () => {
      console.log('✅ Player connected:', playerSocket.id);
      // Player will join room after host joins (triggered from host ROOM_JOINED event)
    });
    
    playerSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Player joined room');
      console.log('👥 Users in room (from player ROOM_JOINED):', data.room.users?.length || 0);
      playerJoined = true;
    });
    
    playerSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Player socket error:', error);
    });
    
    // Delay player connection to ensure host joins first
    setTimeout(() => {
      if (!playerSocket.connected) {
        // Player socket should auto-connect
      }
    }, 2000);
  });
}

// Run the test
testRoomDetailsWithMultipleUsers()
  .then(result => {
    console.log('✅ Test completed successfully!');
    console.log('📊 Final room details:', JSON.stringify(result.data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
