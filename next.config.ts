import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow server-side API calls to Anthropic and Apify
  serverExternalPackages: [],

  // Increase body size limit for AI responses
  experimental: {},

  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

export default nextConfig;
