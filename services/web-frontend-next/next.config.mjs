/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/search/:path*',
        destination: `http://search-service:3000/search/:path*`,
      },
      {
        source: '/api/order/:path*',
        destination: `http://order-service:3001/order/:path*`,
      },
    ];
  },
};

export default nextConfig;
