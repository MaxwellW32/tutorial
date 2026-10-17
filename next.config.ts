import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // Cache Components: pages are prerendered into a static shell, and anything that reads
  // request data (cookies, search params, uncached database reads) streams in behind <Suspense>.
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // next/image refuses unknown hosts, so Google profile pictures have to be allowed explicitly.
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
