import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/container';
import { ArrowLeft } from '@/components/icons';
import { PROFILE } from '@/content/profile';

export const metadata: Metadata = {
  title: 'Message not sent',
  description: 'Your message did not go through. Try the form again, or email me directly.',
  robots: { index: false },
};

/** Where the contact form lands when it is posted without JavaScript and the message could not be sent. The form is on this page too, in the ending. */
export default function NotSent() {
  return (
    <Container className="py-24 lg:py-36">
      <h1 className="text-display leading-[1.04] font-semibold tracking-tighter">Your message did not go through.</h1>
      <p className="mt-5 max-w-[52ch] text-lead text-text-body">
        Something was missing or the mail service did not answer. Try again with the form below, or write to me at{' '}
        <a href={`mailto:${PROFILE.email}`} className="link link-in-text text-text-primary">
          {PROFILE.email}
        </a>
        .
      </p>
      <Link href="/" className="page-back link mt-8 inline-flex items-center gap-2 text-text-primary">
        <ArrowLeft /> Back to the start
      </Link>
    </Container>
  );
}
