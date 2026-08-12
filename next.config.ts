import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdfkit"],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
