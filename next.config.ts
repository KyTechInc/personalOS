import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    browserDebugInfoInTerminal: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
