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
      // Google crawled the dated slug under /posts (404 in GSC 2026-10-08).
      { source: "/posts/2026-07-12-mcp-oauth-pkce-lab", destination: lab, permanent: true },
      { source: "/:locale(en|zh|ko)/posts/2026-07-12-mcp-oauth-pkce-lab", destination: lab, permanent: true },
      // Legacy numbered slug (GSC 404, crawled 2026-10-12): the MCP gateway/architecture topic
      // now lives in the 2026-06-03 architecture post (EN + zh; ko falls back to EN).
      { source: "/posts/001-mcp-gateway-proxy", destination: "/posts/2026-06-03-mcp-architecture-best-practices", permanent: true },
      { source: "/zh/posts/001-mcp-gateway-proxy", destination: "/zh/posts/2026-06-03-mcp-architecture-best-practices", permanent: true },
      { source: "/ko/posts/001-mcp-gateway-proxy", destination: "/posts/2026-06-03-mcp-architecture-best-practices", permanent: true },
    ];
  },
};

export default nextConfig;
