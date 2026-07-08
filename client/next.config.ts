import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  eslint: {
    // The build should not fail because of pre-existing lint issues.
    // Lint is still run as its own non-blocking CI step for visibility.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
