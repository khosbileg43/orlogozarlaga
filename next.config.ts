const rawRepo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const repo =
  /^[A-Za-z0-9._-]+$/.test(rawRepo) && rawRepo !== "." && rawRepo !== ".."
    ? rawRepo
    : "";
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  // Keep API routes enabled for basic full-stack deployment.
  basePath: isProd && repo ? `/${repo}` : "",
  assetPrefix: isProd && repo ? `/${repo}/` : "",
  trailingSlash: true,
  images: { unoptimized: isProd && Boolean(repo) },
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
