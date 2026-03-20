/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vhuxxrogqmbcqoisdkse.supabase.co', 'img.clerk.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

module.exports = nextConfig;
