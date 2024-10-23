/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 允许任意域名的 HTTPS 图片加载
      },
      {
        protocol: "http",
        hostname: "**", // 允许任意域名的 HTTP 图片加载
      },
    ],
  },
};
export default nextConfig;
