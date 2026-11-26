import type { NextConfig } from 'next';

// Static export: the site is a folder of HTML/CSS/JS that any static host can serve.
// No server runtime and no image optimizer: images are pre-sized WebP in /public.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
