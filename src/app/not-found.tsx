import Link from 'next/link';
import { Container } from '@/components/container';

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="font-mono text-xs uppercase tracking-wide text-accent">404</p>
      <h1 className="mt-2 text-4xl font-semibold">That page isn&apos;t here.</h1>
      <Link href="/" className="mt-6 inline-block text-text-primary underline">
        Back to the start
      </Link>
    </Container>
  );
}
