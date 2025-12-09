// Debug script to help identify build issues
const { spawn } = require('child_process');

console.log('🔍 Starting build debug process...\n');

// Set environment variables for build
const env = {
  ...process.env,
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb://localhost:27017/discord-clone-build', // Dummy URI for build
  JWT_SECRET: 'build-time-secret-key-for-debugging-only',
  NEXTAUTH_SECRET: 'build-time-nextauth-secret',
  NEXT_PUBLIC_SOCKET_URL: '',
};

console.log('Environment variables set:');
console.log('- NODE_ENV:', env.NODE_ENV);
console.log('- MONGODB_URI:', env.MONGODB_URI ? 'Set' : 'Not set');
console.log('- JWT_SECRET:', env.JWT_SECRET ? 'Set' : 'Not set');
console.log('- NEXTAUTH_SECRET:', env.NEXTAUTH_SECRET ? 'Set' : 'Not set');
console.log('- NEXT_PUBLIC_SOCKET_URL:', env.NEXT_PUBLIC_SOCKET_URL);
console.log();

// Run the build
console.log('🏗️ Running Next.js build...\n');

const build = spawn('npm', ['run', 'build:render'], {
  stdio: 'inherit',
  env: env,
  shell: true
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Build completed successfully!');
  } else {
    console.log(`\n❌ Build failed with exit code ${code}`);
  }
  process.exit(code);
});

build.on('error', (error) => {
  console.error('\n❌ Build process error:', error);
  process.exit(1);
});