/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          /*{
            protocol: 'https',
            hostname: 'assets.aceternity.com',
            port: '',
            
          },
          {
            protocol: 'https',
            hostname: 'pbs.twimg.com',
            port: '',
            
          },*/
          {
            protocol: 'https',
            hostname: '**', 
          }
        ],
      },
      webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        config.externals.push('pino-pretty', 'encoding');
        return config;
      },
};

export default nextConfig;
