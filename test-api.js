const http = require('http');

async function testAPIOnly() {
  console.log('📡 Testing room creation API...');

  const postData = JSON.stringify({
    hostId: 'test-host-123',
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

  try {
    const data = await new Promise((resolve, reject) => {
      console.log('📤 Making HTTP request...');
      const req = http.request(options, (res) => {
        console.log('📥 Response received, status:', res.statusCode);
        let body = '';
        res.on('data', (chunk) => {
          console.log('📦 Received chunk:', chunk.length, 'bytes');
          body += chunk;
        });
        res.on('end', () => {
          console.log('✅ Response complete, body:', body);
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            console.error('❌ JSON parse error:', e.message);
            reject(e);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('❌ Request error:', error.message);
        reject(error);
      });
      
      req.on('timeout', () => {
        console.error('❌ Request timeout');
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.setTimeout(5000); // 5 second timeout
      req.write(postData);
      req.end();
    });

    console.log('🎉 API test successful:', data);
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPIOnly();
