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
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [],
  },
}

export default nextConfig
