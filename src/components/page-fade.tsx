'use client';

import { usePathname } from 'next/navigation';
import { ViewTransition } from 'react';

/**
 * Makes every change of page a view transition, so the whole window cross-fades from the old page
 * to the new one (styled on `::view-transition-*(root)` in globals.css). React only starts a view
 * transition when a <ViewTransition> boundary enters, leaves or changes; this one is a 1px marker
 * re-keyed by the path, so that happens on every navigation and the fade is left to the root.
 * Projects whose plate travels already did this; now all pages do, the plate travelling on top.
 */
export function PageFade() {
  const path = usePathname();
  return (
    <ViewTransition key={path}>
      <i className="page-fade" aria-hidden="true" />
    </ViewTransition>
  );
}
