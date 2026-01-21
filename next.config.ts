import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // cacheComponents: true,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
