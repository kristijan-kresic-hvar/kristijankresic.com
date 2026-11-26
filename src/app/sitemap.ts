import type { MetadataRoute } from 'next';
import { WORK } from '@/content/work';

export const dynamic = 'force-static';

/** Every page a search engine should know: the landing, About and each case study. The two form result pages are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/about/', ...WORK.map((w) => `/work/${w.slug}/`)].map((path) => ({ url: `https://kristijankresic.com${path}` }));
}
