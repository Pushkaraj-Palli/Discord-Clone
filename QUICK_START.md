# 🚀 Quick Start - Deploy to Vercel in 5 Minutes

## Step 1: Run Deployment Script (Windows)

```bash
# Simply double-click or run:
deploy.bat
```

## Step 2: Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user
4. Get connection string
5. Whitelist all IPs (0.0.0.0/0)

## Step 3: Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/discord-clone
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

5. Click "Deploy"!

## Step 4: Test Your App

- Your app will be available at `https://your-app-name.vercel.app`
- Register a new account
- Create a server
- Start chatting!

## Making Future Changes

1. Make changes locally
2. Commit to Git:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel automatically redeploys!

## Need Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🐛 Check Vercel function logs for errors
- 🔧 Verify environment variables are set correctly

That's it! Your Discord clone is now live! 🎉