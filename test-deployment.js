// Test script for local unified deployment
// Run this to test the unified server locally before deploying to Render

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting unified deployment test...\n');

// Start the unified server
console.log('📦 Starting unified server...');
const server = spawn('node', ['render-server.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '10000',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-clone-test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-key-for-development-only',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-nextauth-secret',
    NEXT_PUBLIC_SOCKET_URL: '', // Empty for same-origin connections
  }
});

server.stdout.on('data', (data) => {
  console.log(`📊 Server: ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`❌ Server Error: ${data.toString().trim()}`);
});

// Wait for server to start, then run tests
setTimeout(() => {
  console.log('\n🧪 Running health check tests...\n');
  
  // Test health endpoint
  const healthCheck = http.get('http://localhost:10000/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const healthData = JSON.parse(data);
        console.log('✅ Health Check Response:', healthData);
        
        if (healthData.status === 'healthy') {
          console.log('✅ Health check passed!');
        } else {
          console.log('❌ Health check failed!');
        }
      } catch (error) {
        console.error('❌ Health check parse error:', error);
      }
    });
  });
  
  healthCheck.on('error', (error) => {
    console.error('❌ Health check request error:', error);
  });
  
  // Test Next.js frontend
  setTimeout(() => {
    const frontendCheck = http.get('http://localhost:10000/', (res) => {
      console.log(`✅ Frontend Status: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log('✅ Frontend is accessible!');
      } else {
        console.log('❌ Frontend check failed!');
      }
    });
    
    frontendCheck.on('error', (error) => {
      console.error('❌ Frontend check error:', error);
    });
  }, 2000);
  
  // Cleanup after tests
  setTimeout(() => {
    console.log('\n🧹 Cleaning up test server...');
    server.kill('SIGTERM');
    process.exit(0);
  }, 10000);
  
}, 5000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Terminating test...');
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating test...');
  server.kill('SIGTERM');
  process.exit(0);
});