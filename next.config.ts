import type { NextConfig } from "next";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProd && repo
    ? {
        basePath: `/${repo}`,
        assetPrefix: `/${repo}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
