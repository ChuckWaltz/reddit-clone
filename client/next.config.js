/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
      },
    ];
  },
};

module.exports = nextConfig;
