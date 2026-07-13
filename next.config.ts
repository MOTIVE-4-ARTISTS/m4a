import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permanent redirects for the July 2026 About restructure (board minutes
  // 2026-07-13): the standalone Vision page merged into Mission, and
  // "What Matters" was renamed to "Values". 308 preserves any inbound
  // links + accrued SEO to the old URLs.
  async redirects() {
    return [
      { source: "/about/vision", destination: "/about/mission", permanent: true },
      { source: "/about/what-matters", destination: "/about/values", permanent: true },
    ];
  },
};

export default nextConfig;
