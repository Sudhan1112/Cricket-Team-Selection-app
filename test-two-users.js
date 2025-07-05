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

async function testTwoUsers() {
  console.log('🧪 Testing Two Users Flow...');
  
  const hostSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  const playerSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  
  let roomId = null;
  let hostJoined = false;
  let playerJoined = false;
  let hostReceivedUserJoined = false;
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timeout'));
    }, 30000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      hostSocket.disconnect();
      playerSocket.disconnect();
    };
    
    // Host socket events
    hostSocket.on('connect', async () => {
      console.log('✅ Host connected:', hostSocket.id);
      
      try {
        const response = await createRoom(hostSocket.id, 'Host User');
        roomId = response.data.roomId;
        console.log('🏠 Room created:', roomId);
        
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
      console.log('✅ Host joined room');
      console.log('👥 Users in room (host ROOM_JOINED):', data.room.users?.length);
      hostJoined = true;
      
      // Now make player join
      if (playerSocket.connected) {
        console.log('🚪 Player joining room...');
        playerSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          roomId: roomId,
          userId: playerSocket.id,
          userName: 'Player User'
        });
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('👥 HOST received USER_JOINED event:', data.user?.name);
      console.log('👥 Room users count (host USER_JOINED):', data.room?.users?.length);
      hostReceivedUserJoined = true;
      
      // Check if test is complete
      if (hostJoined && playerJoined && hostReceivedUserJoined) {
        cleanup();
        resolve({
          success: true,
          roomId,
          hostJoined,
          playerJoined,
          hostReceivedUserJoined,
          finalUsersCount: data.room?.users?.length
        });
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.ROOM_UPDATED, (data) => {
      console.log('🔄 HOST received ROOM_UPDATED event');
      console.log('🔄 Room users count (host ROOM_UPDATED):', data.room?.users?.length);
    });
    
    // Player socket events
    playerSocket.on('connect', () => {
      console.log('✅ Player connected:', playerSocket.id);
    });
    
    playerSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Player joined room');
      console.log('👥 Users in room (player ROOM_JOINED):', data.room.users?.length);
      playerJoined = true;
    });
    
    playerSocket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('👥 PLAYER received USER_JOINED event:', data.user?.name);
    });
    
    playerSocket.on(SOCKET_EVENTS.ROOM_UPDATED, (data) => {
      console.log('🔄 PLAYER received ROOM_UPDATED event');
      console.log('🔄 Room users count (player ROOM_UPDATED):', data.room?.users?.length);
    });
    
    // Error handlers
    hostSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Host socket error:', error);
      cleanup();
      reject(new Error(`Host error: ${error.message}`));
    });
    
    playerSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Player socket error:', error);
    });
  });
}

// Run the test
testTwoUsers()
  .then(result => {
    console.log('✅ Two users test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Two users test failed:', error.message);
    process.exit(1);
  });
