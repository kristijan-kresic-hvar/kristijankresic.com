import type { NextConfig } from 'next';

// Static export: the site is a folder of HTML/CSS/JS that any static host can serve.
// No server runtime and no image optimizer: images are pre-sized WebP in /public.
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // The stylesheet is small (Tailwind) and the host lets browsers cache files for only 10 seconds, so a separate
  // request buys nothing: put the CSS in the page and save the round trip before first paint.
  experimental: { inlineCss: true },
};

export default nextConfig;
