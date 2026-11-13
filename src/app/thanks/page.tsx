import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/container';
import { ArrowLeft } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Message sent',
  robots: { index: false },
};

/** Where the contact form lands when it is posted without JavaScript. */
export default function Thanks() {
  return (
    <Container className="py-24 lg:py-36">
      <h1 className="text-display leading-[1.04] font-semibold tracking-tighter">Thanks. Your message is with me.</h1>
      <p className="mt-5 text-lead text-text-body">I will reply to the address you gave, usually the same day.</p>
      <Link href="/" className="link mt-8 inline-flex items-center gap-2 text-text-primary">
        <ArrowLeft /> Back to the start
      </Link>
    </Container>
  );
}
