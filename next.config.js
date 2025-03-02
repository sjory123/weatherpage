/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false
      };
    }
    return config;
  }
};

module.exports = nextConfig;