/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
    mdxRs: true,
  },
  images: {
    protocols: ["http", "https", "data"],
    hostname: "*",
  },
};

export default nextConfig;
