import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Nav } from '@/components/nav';
import { ContactClose } from '@/components/contact-close';
import { Footer } from '@/components/footer';
import { PROFILE } from '@/content/profile';
import './globals.css';

const geist = Geist({ subsets: ['latin', 'latin-ext'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://kristijankresic.com'),
  title: {
    default: `${PROFILE.name} — Frontend engineer (React / Next.js / TypeScript)`,
    template: `%s — ${PROFILE.name}`,
  },
  description:
    'Frontend engineer with 4+ years shipping production React, Next.js, TypeScript and React Native products for North American clients. Based in Croatia, available now.',
  openGraph: {
    type: 'website',
    siteName: PROFILE.name,
    title: `${PROFILE.name} — Frontend engineer`,
    description: '4+ years shipping production web and mobile products. React · Next.js · TypeScript. Available now.',
    images: [{ url: '/images/og.png', width: 1200, height: 630, alt: `${PROFILE.name} — frontend engineer` }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-bg-base"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <ContactClose />
        <Footer />
      </body>
    </html>
  );
}
