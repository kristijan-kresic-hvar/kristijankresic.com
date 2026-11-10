import Link from 'next/link';
import { Container } from '@/components/container';
import { ArrowLeft } from '@/components/icons';

export default function NotFound() {
  return (
    <Container className="py-24 lg:py-36">
      <h1 className="text-display leading-[1.04] font-semibold tracking-tighter">That page isn&apos;t here.</h1>
      <p className="mt-5 text-lead text-text-body">The address may have changed, or it never existed.</p>
      <Link href="/" className="link mt-8 inline-flex items-center gap-2 text-text-primary">
        <ArrowLeft /> Back to the start
      </Link>
    </Container>
  );
}
