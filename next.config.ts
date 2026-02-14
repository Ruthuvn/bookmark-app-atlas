import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/metrics/lib.js",
        destination: "https://cloud.umami.is/script.js",
      },
      {
        source: "/metrics/api/send",
        destination: "https://cloud.umami.is/api/send",
      },
    ];
  },
};

export default nextConfig;
