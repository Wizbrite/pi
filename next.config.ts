import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['10.102.159.25'],
  turbopack: {},
  webpack: (config) => {
    // Required for react-pdf / pdfjs-dist to work with Next.js
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
