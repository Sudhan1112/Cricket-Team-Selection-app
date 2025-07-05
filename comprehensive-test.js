const io = require('socket.io-client');
const http = require('http');

const SOCKET_URL = 'http://localhost:3002';
const API_BASE = 'http://localhost:3002/api';

const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  ROOM_JOINED: 'room-joined',
  USER_JOINED: 'user-joined',
  ROOM_UPDATED: 'room-updated',
  START_SELECTION: 'start-selection',
  SELECTION_STARTED: 'selection-started',
  ERROR: 'error'
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/health',
      method: 'GET'
    };
    
    const result = await makeRequest(options);
    console.log('✅ Health check status:', result.status);
    console.log('✅ Health check response:', result.data);
    return result.status === 200;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Room Health Check
async function testRoomHealthCheck() {
  console.log('\n🏠 Testing Room Health Check...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/rooms/health/check',
      method: 'GET'
    };
    
    const result = await makeRequest(options);
    console.log('✅ Room health status:', result.status);
    console.log('✅ Room health response:', result.data);
    return result.status === 200;
  } catch (error) {
    console.error('❌ Room health check failed:', error.message);
    return false;
  }
}

// Test 3: Get Available Players
async function testGetPlayers() {
  console.log('\n🏏 Testing Get Available Players...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/rooms/players/available',
      method: 'GET'
    };
    
    const result = await makeRequest(options);
    console.log('✅ Players API status:', result.status);
    console.log('✅ Players count:', result.data.data?.count);
    return result.status === 200 && result.data.data?.count > 0;
  } catch (error) {
    console.error('❌ Get players failed:', error.message);
    return false;
  }
}

// Test 4: Create Room via API
async function testCreateRoomAPI() {
  console.log('\n🏗️ Testing Create Room API...');
  try {
    const postData = JSON.stringify({
      hostId: 'test-host-123',
      hostName: 'Test Host'
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

    const result = await makeRequest(options, postData);
    console.log('✅ Create room status:', result.status);
    console.log('✅ Created room ID:', result.data.data?.roomId);
    
    if (result.status === 201 && result.data.data?.roomId) {
      return result.data.data.roomId;
    }
    return null;
  } catch (error) {
    console.error('❌ Create room API failed:', error.message);
    return null;
  }
}

// Test 5: Socket.IO Connection Test
async function testSocketConnection() {
  console.log('\n🔌 Testing Socket.IO Connection...');
  
  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 10000
    });

    let connected = false;
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      connected = true;
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      resolve(false);
    });

    setTimeout(() => {
      if (!connected) {
        console.error('❌ Socket connection timeout');
        socket.disconnect();
        resolve(false);
      }
    }, 5000);
  });
}

// Test 6: Socket Room Join Test
async function testSocketRoomJoin() {
  console.log('\n🚪 Testing Socket Room Join...');
  
  return new Promise((resolve) => {
    const hostSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    const playerSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    let hostConnected = false;
    let playerConnected = false;
    let roomJoined = false;
    let userJoinedReceived = false;

    // Host connection
    hostSocket.on('connect', () => {
      console.log('✅ Host socket connected:', hostSocket.id);
      hostConnected = true;
      
      // Host joins room
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      console.log('🏠 Host creating room:', roomId);
      hostSocket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId, userId: hostSocket.id, userName: 'Host User' });
    });

    // Host room joined
    hostSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Host joined room:', data.room.id);
      roomJoined = true;
      
      // Now connect player
      if (playerConnected) {
        console.log('👤 Player joining room:', data.room.id);
        playerSocket.emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: data.room.id, userId: playerSocket.id, userName: 'Player User' });
      }
    });

    // Host receives user joined
    hostSocket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('✅ Host received USER_JOINED:', data.user.name);
      console.log('✅ Room users count:', data.room.users.length);
      userJoinedReceived = true;
      
      // Test complete
      hostSocket.disconnect();
      playerSocket.disconnect();
      resolve(true);
    });

    // Player connection
    playerSocket.on('connect', () => {
      console.log('✅ Player socket connected:', playerSocket.id);
      playerConnected = true;
    });

    // Player room joined
    playerSocket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
      console.log('✅ Player joined room:', data.room.id);
    });

    // Error handling
    hostSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Host socket error:', error);
      hostSocket.disconnect();
      playerSocket.disconnect();
      resolve(false);
    });

    playerSocket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Player socket error:', error);
      hostSocket.disconnect();
      playerSocket.disconnect();
      resolve(false);
    });

    // Timeout
    setTimeout(() => {
      if (!userJoinedReceived) {
        console.error('❌ Socket room join test timeout');
        hostSocket.disconnect();
        playerSocket.disconnect();
        resolve(false);
      }
    }, 10000);
  });
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Comprehensive Backend & API Tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    roomHealthCheck: await testRoomHealthCheck(),
    getPlayers: await testGetPlayers(),
    createRoomAPI: await testCreateRoomAPI(),
    socketConnection: await testSocketConnection(),
    socketRoomJoin: await testSocketRoomJoin()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests PASSED! Backend is fully functional.');
  } else {
    console.log('⚠️ Some tests FAILED. Check the issues above.');
  }
  
  process.exit(0);
}

// Run tests
runAllTests().catch(console.error);
