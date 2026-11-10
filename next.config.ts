import type { NextConfig } from 'next';

// Static export: the site is a folder of HTML/CSS/JS served by nginx on a plain VPS.
// No server runtime, no image optimizer — images are pre-sized WebP in /public.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
