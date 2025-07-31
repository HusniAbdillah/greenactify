import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'source.pexels.com',
      'images.pexels.com',
      'img.clerk.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;