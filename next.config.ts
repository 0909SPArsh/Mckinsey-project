import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '16mb',
    },
  },
  // Increase the API route body size limit for PDF uploads
  serverExternalPackages: [],
};

export default nextConfig;
