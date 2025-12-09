/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || '',
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
  },
  serverExternalPackages: ['mongoose'],
  // Optimize for Render deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

export default nextConfig
