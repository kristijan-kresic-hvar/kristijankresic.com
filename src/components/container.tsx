import type { ReactNode } from 'react';

/** Page frame: a fluid gutter (`--gutter`) instead of a narrow centred column, capped for very wide screens. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-page px-(--gutter) ${className}`}>{children}</div>;
}
