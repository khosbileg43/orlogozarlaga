const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  output: "export",
  // GitHub Pages дээр “folder” доор serve хийдэг тул:
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  trailingSlash: true,
  // next/image ашиглаж байвал Pages дээр default image optimization ажиллахгүй тул:
  images: { unoptimized: true },
};
