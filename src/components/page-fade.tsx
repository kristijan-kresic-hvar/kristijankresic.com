'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, ViewTransition } from 'react';

/**
 * Wraps the page in the layout. The About page fades in when it opens and out when it is left
 * (`.page-in` and `.page-out` in globals.css); every other page changes as before, so a project's
 * plate travelling between the hero and its case study is the only motion there.
 * Keyed by the path, because React animates a boundary that leaves and one that enters, and a
 * layout's own children never do either. Named pairs inside (the project plates) still travel.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const path = usePathname();
  const fades = path.startsWith('/about');
  return (
    <ViewTransition key={path} enter={fades ? 'page-in' : 'none'} exit={fades ? 'page-out' : 'none'} default="none">
      {children}
    </ViewTransition>
  );
}
