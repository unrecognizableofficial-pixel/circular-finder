import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "circular-finder";
  const isPagesBuild = process.env.GITHUB_ACTIONS === "true";
  const basePath = isPagesBuild ? `/${repoName}` : "";

  return {
    // Keep the dev server isolated from production/export builds so stale chunks do not cross over.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
    output: "export",
    trailingSlash: true,
    images: {
      unoptimized: true
    },
    basePath,
    assetPrefix: basePath || undefined
  };
}
