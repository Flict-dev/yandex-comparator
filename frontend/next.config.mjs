/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL ?? "http://backend:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/compare",
        destination: `${backendUrl}/compare`,
      },
      {
        source: "/health",
        destination: `${backendUrl}/health`,
      },
    ];
  },
};

export default nextConfig;
