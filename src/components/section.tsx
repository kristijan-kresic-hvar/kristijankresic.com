import type { ReactNode } from 'react';
import { Container } from './container';

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = '',
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 py-16 sm:py-24 ${className}`}>
      <Container>
        <p className="font-mono text-xs uppercase tracking-wide text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}
