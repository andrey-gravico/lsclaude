import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow placeholder images for development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Disable image optimization for static export if needed
    unoptimized: process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true',
  },
  // Enable static export for hosting on static servers
  // output: 'export',
};

export default nextConfig;
