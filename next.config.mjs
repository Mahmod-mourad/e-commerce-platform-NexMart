/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Both of these were true, so `next build` reported success no matter how many
  // type or lint errors the project had. A build that cannot fail is not a check.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    // `domains` is deprecated in favour of remotePatterns.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: true,
  },
}

export default nextConfig
