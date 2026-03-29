/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Auth & Users -> User Service trực tiếp
      {
        source: '/api/auth/:path*',
        destination: `http://user-service-demo:3000/auth/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `http://user-service-demo:3000/users/:path*`,
      },
      // Products & Categories -> Product Service trực tiếp
      {
        source: '/api/products',
        destination: `http://product-service-demo:3001/products`,
      },
      {
        source: '/api/products/:path*',
        destination: `http://product-service-demo:3001/products/:path*`,
      },
      {
        source: '/api/categories',
        destination: `http://product-service-demo:3001/categories`,
      },
      {
        source: '/api/categories/:path*',
        destination: `http://product-service-demo:3001/categories/:path*`,
      },
      // Search -> Search Service trực tiếp
      {
        source: '/api/search/:path*',
        destination: `http://search-service-demo:3000/search/:path*`,
      },
      // Order -> Order Service trực tiếp
      {
        source: '/api/order/:path*',
        destination: `http://order-service-demo:3001/order/:path*`,
      },
    ];
  },
};

export default nextConfig;
