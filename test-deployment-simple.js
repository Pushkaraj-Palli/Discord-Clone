// Simple deployment test
const https = require('https');

const testEndpoints = [
  '/health',
  '/api/auth',
  '/'
];

const baseUrl = 'https://discord-clone-app-wcfo.onrender.com';

async function testEndpoint(path) {
  return new Promise((resolve) => {
    const url = `${baseUrl}${path}`;
    console.log(`Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path,
        error: 'Timeout'
      });
    });
  });
}

async function runTests() {
  console.log('Testing deployment endpoints...\n');
  
  for (const path of testEndpoints) {
    const result = await testEndpoint(path);
    console.log(`${path}:`, result);
    console.log('---');
  }
}

runTests();