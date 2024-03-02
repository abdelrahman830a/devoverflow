/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: ["*"], // Allow images from all domains
    path: "/", // Path for serving images
  },
};

export default nextConfig;
