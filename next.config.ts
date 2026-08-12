import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {
    "/**": ["./server/assets/**"],
  },
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
