# Discord-Clone

## Features

- User authentication with JWT
- User registration and login
- User status management (online, offline, idle, dnd)
- Modern UI with responsive design

## Tech Stack

- Next.js 15
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Tailwind CSS
- Shadcn UI Components

## Authentication

This project uses JWT (JSON Web Tokens) for authentication. User credentials are stored in MongoDB with passwords securely hashed using bcrypt.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB connection string
MONGODB_URI=your_mongodb_connection_string

# JWT Secret Key (generate a strong random string)
JWT_SECRET=your_jwt_secret_key_here
```

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install` or `pnpm install`
3. Create `.env.local` file with required environment variables
4. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
