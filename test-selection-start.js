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

async function testStartSelection() {
  console.log('🧪 Testing Start Selection Flow...');
  
  const hostSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  const playerSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  
  let roomId = null;
  let selectionStarted = false;
  
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
      
      // Make player join
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
      console.log('👥 Room users count:', data.room?.users?.length);
      
      // Now try to start selection
      if (data.room?.users?.length >= 2) {
        console.log('🎮 Starting selection...');
        hostSocket.emit(SOCKET_EVENTS.START_SELECTION, {
          roomId: roomId
        });
      }
    });
    
    hostSocket.on(SOCKET_EVENTS.SELECTION_STARTED, (data) => {
      console.log('🎮 HOST received SELECTION_STARTED event');
      console.log('🎮 Selection data:', data);
      selectionStarted = true;
      
      cleanup();
      resolve({
        success: true,
        roomId,
        selectionStarted,
        usersCount: data.room?.users?.length
      });
    });
    
    // Player socket events
    playerSocket.on('connect', () => {
      console.log('✅ Player connected:', playerSocket.id);
    });
    
    playerSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Player joined room');
      console.log('👥 Users in room (player):', data.room.users?.length);
    });
    
    playerSocket.on(SOCKET_EVENTS.SELECTION_STARTED, (data) => {
      console.log('🎮 PLAYER received SELECTION_STARTED event');
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
testStartSelection()
  .then(result => {
    console.log('✅ Start selection test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Start selection test failed:', error.message);
    process.exit(1);
  });
