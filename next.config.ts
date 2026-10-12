import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const dir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: dir },
  outputFileTracingRoot: dir,
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    // B3: short slug was never a blog post — lab lives in enterprise-ai-design.
    const lab =
      "https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.md";
    return [
      { source: "/mcp-oauth-pkce-lab", destination: lab, permanent: true },
      { source: "/posts/mcp-oauth-pkce-lab", destination: lab, permanent: true },
      { source: "/:locale(en|zh|ko)/mcp-oauth-pkce-lab", destination: lab, permanent: true },
    ];
  },
};

export default nextConfig;
