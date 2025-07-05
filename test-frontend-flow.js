const puppeteer = require('puppeteer');

async function testFrontendFlow() {
  console.log('🧪 Testing Frontend Flow with Browser Automation...');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      devtools: true,  // Open devtools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create two pages (host and player)
    const hostPage = await browser.newPage();
    const playerPage = await browser.newPage();
    
    // Enable console logging
    hostPage.on('console', msg => console.log('HOST CONSOLE:', msg.text()));
    playerPage.on('console', msg => console.log('PLAYER CONSOLE:', msg.text()));
    
    // Navigate to frontend
    console.log('📱 Opening frontend pages...');
    await hostPage.goto('http://localhost:5173');
    await playerPage.goto('http://localhost:5173');
    
    // Wait for pages to load
    await hostPage.waitForSelector('input[placeholder="Enter your name"]', { timeout: 10000 });
    await playerPage.waitForSelector('input[placeholder="Enter your name"]', { timeout: 10000 });
    
    console.log('✅ Frontend pages loaded');
    
    // Host creates room
    console.log('🏠 Host creating room...');
    await hostPage.type('input[placeholder="Enter your name"]', 'Host User');
    await hostPage.click('button:has-text("Create Room")');
    
    // Wait for room to be created and get room ID
    await hostPage.waitForSelector('[data-testid="room-id"], .room-id, .text-2xl', { timeout: 10000 });
    
    const roomId = await hostPage.evaluate(() => {
      // Try multiple selectors to find room ID
      const selectors = [
        '[data-testid="room-id"]',
        '.room-id',
        '.text-2xl',
        'h2',
        'div:contains("Room ID")'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.includes('-')) {
          return element.textContent.trim();
        }
      }
      
      // Fallback: look for any element containing a UUID pattern
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        if (el.textContent && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(el.textContent)) {
          return el.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0];
        }
      }
      
      return null;
    });
    
    if (!roomId) {
      throw new Error('Could not find room ID on host page');
    }
    
    console.log('🏠 Room created with ID:', roomId);
    
    // Player joins room
    console.log('👤 Player joining room...');
    await playerPage.type('input[placeholder="Enter your name"]', 'Player User');
    await playerPage.click('button:has-text("Join Room")');
    
    // Enter room ID
    await playerPage.waitForSelector('input[placeholder="Enter room ID"]', { timeout: 5000 });
    await playerPage.type('input[placeholder="Enter room ID"]', roomId);
    await playerPage.click('button:has-text("Join")');
    
    // Wait a moment for events to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check host page for player visibility
    console.log('🔍 Checking if host can see player...');
    
    const hostCanSeePlayer = await hostPage.evaluate(() => {
      // Look for player in the UI
      const playerElements = document.querySelectorAll('*');
      for (const el of playerElements) {
        if (el.textContent && el.textContent.includes('Player User')) {
          return true;
        }
      }
      return false;
    });
    
    console.log('👥 Host can see player:', hostCanSeePlayer);
    
    // Check start selection button
    const startButtonEnabled = await hostPage.evaluate(() => {
      const startButton = document.querySelector('button:has-text("Start Selection"), button[disabled]:has-text("Start")');
      return startButton && !startButton.disabled;
    });
    
    console.log('🎮 Start selection button enabled:', startButtonEnabled);
    
    // Get console logs from both pages
    const hostLogs = await hostPage.evaluate(() => {
      return window.console._logs || [];
    });
    
    const playerLogs = await playerPage.evaluate(() => {
      return window.console._logs || [];
    });
    
    return {
      success: true,
      roomId,
      hostCanSeePlayer,
      startButtonEnabled,
      hostLogs,
      playerLogs
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
async function checkPuppeteer() {
  try {
    require('puppeteer');
    return true;
  } catch (error) {
    console.log('⚠️ Puppeteer not available, skipping browser automation test');
    console.log('💡 Please test manually by:');
    console.log('1. Open http://localhost:5173 in two browser tabs');
    console.log('2. Create room as host in first tab');
    console.log('3. Join room as player in second tab');
    console.log('4. Check browser console for debugging logs');
    return false;
  }
}

// Run test
checkPuppeteer().then(available => {
  if (available) {
    return testFrontendFlow();
  } else {
    return { success: false, reason: 'Puppeteer not available' };
  }
}).then(result => {
  if (result.success) {
    console.log('✅ Frontend test completed!');
    console.log('📊 Results:', JSON.stringify(result, null, 2));
  } else {
    console.log('⚠️ Test skipped:', result.reason);
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Frontend test failed:', error.message);
  process.exit(1);
});
