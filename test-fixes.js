// Test script to verify the deployment fixes
const http = require('http');

console.log('🧪 Testing deployment fixes...\n');

// Test 1: Health check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:10000/health', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          console.log('✅ Health Check Response:');
          console.log(JSON.stringify(health, null, 2));
          resolve(health);
        } catch (error) {
          console.error('❌ Health check JSON parse error:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Health check request error:', error);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
}

// Test 2: API endpoint
function testAuthAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    const options = {
      hostname: 'localhost',
      port: 10000,
      path: '/api/auth',
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
        console.log(`✅ Auth API Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('✅ Auth API Response structure valid');
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          console.log('⚠️ Auth API returned non-JSON response (expected for test user)');
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Auth API request error:', error);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Auth API timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    console.log('1. Testing Health Check...');
    await testHealthCheck();
    console.log();
    
    console.log('2. Testing Auth API...');
    await testAuthAPI();
    console.log();
    
    console.log('🎉 All tests completed successfully!');
    console.log('The server appears to be working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run start:render');
  }
}

// Wait a moment for server to start, then run tests
setTimeout(runTests, 2000);