import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "date-fns",
    ],
  },
  webpack: (config) => {
    // Required for react-pdf / pdfjs-dist to work with Next.js
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
