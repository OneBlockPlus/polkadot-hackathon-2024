/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'images.unsplash.com',
        protocol: 'https'
      },
      {
        hostname: 'aqua-dull-locust-679.mypinata.cloud',
        protocol: 'https'
      },
      {
        hostname: 'tny.im',
        protocol: 'http'
      },
    ]
  }
};

export default nextConfig;
