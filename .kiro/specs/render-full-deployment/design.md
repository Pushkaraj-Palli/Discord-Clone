# Design Document

## Overview

This design outlines the migration from a split deployment architecture (Next.js on Vercel + Socket.IO on Render) to a unified deployment where both the Next.js application and Socket.IO server run together on a single Render service. The solution involves creating a custom server that combines Next.js with Socket.IO, similar to the existing `server.ts` but optimized for production deployment on Render.

## Architecture

### Current Architecture
- **Frontend**: Next.js app on Vercel (serverless)
- **Backend**: Standalone Socket.IO server on Render
- **Database**: MongoDB Atlas
- **Communication**: Cross-origin WebSocket connections

### Target Architecture
- **Unified Service**: Next.js + Socket.IO server on Render
- **Database**: MongoDB Atlas (unchanged)
- **Communication**: Same-origin WebSocket connections
- **Static Assets**: Served by Next.js built-in static file serving

### Key Benefits
1. **Simplified Infrastructure**: Single service to manage
2. **Reduced Latency**: No cross-origin WebSocket connections
3. **Cost Optimization**: Single Render service instead of Vercel + Render
4. **Easier Development**: Consistent environment between dev and prod

## Components and Interfaces

### 1. Custom Server Entry Point
**File**: `render-server.js` (new file)
- Combines Next.js app with Socket.IO server
- Handles both HTTP requests and WebSocket connections
- Manages application lifecycle and graceful shutdowns

### 2. Next.js Application
**Existing**: Next.js app with API routes
- Serves React frontend
- Handles authentication API routes
- Manages database operations through API endpoints
- Serves static assets

### 3. Socket.IO Integration
**Integration**: Socket.IO server attached to Next.js HTTP server
- Real-time messaging functionality
- User presence management
- Channel-based communication
- JWT-based authentication for WebSocket connections

### 4. Database Layer
**Existing**: MongoDB with Mongoose models
- User management
- Server and channel data
- Message storage
- Authentication data

## Data Models

### Environment Variables (Unified)
```
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret

# App Configuration
NODE_ENV=production
PORT=10000  # Render's default port

# Internal Socket URL (same origin)
NEXT_PUBLIC_SOCKET_URL=  # Empty for same-origin connections
```

### Build Configuration
**package.json** modifications:
- Add build script for production
- Add start script for unified server
- Ensure all dependencies are in main package.json

**Render Configuration**:
- Build Command: `npm install && npm run build`
- Start Command: `npm run start:render`
- Node Version: 18+

## Error Handling

### 1. Server Startup Errors
- **Database Connection**: Retry logic with exponential backoff
- **Port Binding**: Use Render's PORT environment variable
- **Next.js Preparation**: Handle build errors gracefully

### 2. Runtime Errors
- **WebSocket Disconnections**: Automatic reconnection on client side
- **Database Errors**: Proper error responses and logging
- **Authentication Failures**: Clear error messages and token refresh

### 3. Graceful Shutdown
- **SIGTERM Handling**: Close database connections and WebSocket server
- **Active Connections**: Allow existing requests to complete
- **Resource Cleanup**: Proper memory and connection cleanup

## Testing Strategy

### 1. Local Development Testing
- **Environment Parity**: Test unified server locally
- **WebSocket Connections**: Verify same-origin Socket.IO connections
- **API Functionality**: Ensure all existing API routes work
- **Static Assets**: Confirm proper asset serving

### 2. Staging Deployment
- **Render Preview**: Deploy to Render preview environment
- **End-to-End Testing**: Test complete user workflows
- **Performance Testing**: Monitor response times and WebSocket latency
- **Database Connectivity**: Verify MongoDB Atlas connections

### 3. Production Validation
- **Health Checks**: Implement health check endpoints
- **Monitoring**: Set up logging and error tracking
- **Rollback Plan**: Maintain ability to revert to split deployment
- **Load Testing**: Verify performance under expected load

## Implementation Approach

### Phase 1: Server Integration
1. Create unified server file combining Next.js and Socket.IO
2. Update package.json scripts for Render deployment
3. Consolidate environment variables
4. Test locally with production-like configuration

### Phase 2: Render Configuration
1. Update Render service configuration
2. Set environment variables on Render
3. Configure build and start commands
4. Test deployment in Render environment

### Phase 3: Client Updates
1. Update Socket.IO client configuration for same-origin connections
2. Remove Vercel-specific configurations
3. Update CORS settings to allow Render domain
4. Test WebSocket connections from deployed frontend

### Phase 4: Migration and Cleanup
1. Deploy to production Render service
2. Update DNS/domain configuration if needed
3. Monitor application performance and errors
4. Decommission Vercel deployment
5. Clean up unused configuration files

## Security Considerations

### 1. CORS Configuration
- Configure Socket.IO CORS for Render domain
- Remove development origins in production
- Implement proper origin validation

### 2. Environment Variables
- Secure storage of JWT secrets on Render
- Proper MongoDB connection string handling
- No sensitive data in code repository

### 3. WebSocket Authentication
- Maintain JWT-based WebSocket authentication
- Implement proper token validation
- Handle authentication failures gracefully

## Performance Considerations

### 1. Server Resources
- **Memory Usage**: Monitor combined Next.js + Socket.IO memory footprint
- **CPU Usage**: Optimize for Render's container limits
- **Connection Limits**: Handle WebSocket connection scaling

### 2. Static Asset Serving
- **Next.js Optimization**: Use Next.js built-in optimizations
- **Caching**: Implement proper cache headers
- **Compression**: Enable gzip compression for responses

### 3. Database Optimization
- **Connection Pooling**: Optimize MongoDB connection pool
- **Query Performance**: Monitor and optimize database queries
- **Index Usage**: Ensure proper database indexing