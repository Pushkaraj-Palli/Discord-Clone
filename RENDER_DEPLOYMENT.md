# Render Deployment Guide

This guide covers deploying the entire Discord Clone application on Render as a unified service.

## Prerequisites

1. **Render Account**: Create an account at [render.com](https://render.com)
2. **MongoDB Atlas**: Set up a MongoDB database (or use your existing one)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Deployment Steps

### 1. Create New Web Service on Render

1. **Connect Repository**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your Discord clone

2. **Configure Service**:
   - **Name**: `discord-clone-app` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (uses repository root)

3. **Build & Deploy Settings**:
   - **Build Command**: `npm install --legacy-peer-deps && NODE_ENV=production npm run build:render`
   - **Start Command**: `npm run start:render`

### 2. Environment Variables

Set these environment variables in the Render dashboard:

#### Required Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discord-clone?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-key
```

#### Render-Specific Variables
```
RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
RENDER_SERVICE_NAME=your-service-name
```

**Note**: Replace `your-service-name` with your actual Render service name.

### 3. Advanced Settings

#### Health Check
- **Health Check Path**: `/health`
- **Health Check Grace Period**: 300 seconds

#### Auto-Deploy
- Enable "Auto-Deploy" to automatically deploy when you push to your main branch

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying your application
3. Monitor the build logs for any errors
4. Once deployed, your app will be available at `https://your-service-name.onrender.com`

## Post-Deployment Configuration

### 1. Update MongoDB Atlas Network Access
- Add Render's IP addresses to your MongoDB Atlas network access list
- Or use `0.0.0.0/0` for all IPs (less secure but simpler)

### 2. Test Application
- Visit your Render URL
- Test user registration and login
- Test real-time messaging functionality
- Verify WebSocket connections are working

### 3. Custom Domain (Optional)
- In Render dashboard, go to Settings → Custom Domains
- Add your custom domain and configure DNS

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Render sets this automatically) | `10000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT token signing | `your-secret-key` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `your-nextauth-secret` |
| `RENDER_EXTERNAL_URL` | Your Render app URL | `https://your-app.onrender.com` |
| `RENDER_SERVICE_NAME` | Your Render service name | `your-service-name` |

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Connection Issues
- Check if MongoDB Atlas allows connections from Render IPs
- Verify environment variables are set correctly
- Check health endpoint: `https://your-app.onrender.com/health`

### WebSocket Issues
- Verify CORS configuration in server
- Check browser console for connection errors
- Ensure Socket.IO client is connecting to correct path

### Performance Issues
- Monitor resource usage in Render dashboard
- Consider upgrading to a higher plan if needed
- Optimize database queries and connections

## Monitoring

### Health Check
The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "nextjs": "running",
    "socketio": "running",
    "database": "connected"
  }
}
```

### Logs
- View application logs in Render dashboard
- Monitor for errors and performance issues
- Set up log alerts if needed

## Scaling

### Horizontal Scaling
- Render automatically handles load balancing
- Consider upgrading to higher plans for better performance
- Monitor resource usage and scale as needed

### Database Scaling
- Use MongoDB Atlas auto-scaling features
- Monitor database performance and optimize queries
- Consider read replicas for high-traffic applications

## Security

### Environment Variables
- Never commit secrets to version control
- Use Render's environment variable management
- Rotate secrets regularly

### Network Security
- Configure MongoDB Atlas network access properly
- Use HTTPS (automatically provided by Render)
- Implement proper CORS policies

### Application Security
- Keep dependencies updated
- Monitor for security vulnerabilities
- Implement proper input validation and sanitization
## Bui
ld Troubleshooting

### Common Build Issues

#### 1. Html Import Error
If you see an error about `<Html>` being imported outside of `_document`, this is usually caused by:
- Incorrect Next.js configuration
- Build-time database connections
- Missing environment variables during build

**Solution**: Ensure all environment variables are set during build, especially:
```
NODE_ENV=production
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

#### 2. NODE_ENV Warning
If you see warnings about non-standard NODE_ENV values:
- Make sure NODE_ENV is set to exactly `production` in Render
- Use the updated build command: `NODE_ENV=production npm run build:render`

#### 3. Database Connection During Build
If the build fails due to database connection issues:
- Ensure MongoDB Atlas allows connections from Render's IP ranges
- Check that your MongoDB URI is correctly formatted
- Verify network access settings in MongoDB Atlas

#### 4. Missing Dependencies Error
If you see "Cannot find module" errors during startup:
- Ensure all required dependencies are in `package.json` dependencies (not devDependencies)
- Required packages: `jsonwebtoken`, `express`, `cors`, `mongoose`, `bcryptjs`
- Redeploy after updating dependencies

#### 5. Dependency Issues
If you encounter peer dependency warnings:
- Use `npm install --legacy-peer-deps` in the build command
- This is already included in the recommended build command

### Debug Build Locally
To debug build issues locally, run:
```bash
npm run debug:build
```

This will run the build with proper environment variables and help identify issues.

### Render Build Logs
Monitor the build process in Render dashboard:
1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. Watch the build process in real-time
4. Look for specific error messages and stack traces

If the build continues to fail, check:
1. All environment variables are properly set
2. MongoDB Atlas network access allows Render IPs
3. No syntax errors in your code
4. All dependencies are properly installed