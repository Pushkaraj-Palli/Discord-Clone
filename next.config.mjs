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
  },
  // For Vercel deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
}

export default nextConfig
