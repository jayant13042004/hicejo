import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "sharp", "@napi-rs/canvas"]
};

export default nextConfig;
