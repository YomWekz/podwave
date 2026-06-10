/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables exposed to the browser must have NEXT_PUBLIC_ prefix
  env: {
    EDITOR_APP_URL: process.env.NEXT_PUBLIC_EDITOR_APP_URL,
  },
};

module.exports = nextConfig;
