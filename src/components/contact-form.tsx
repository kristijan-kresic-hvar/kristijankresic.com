'use client';

import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { PROFILE } from '@/content/profile';

const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_URL ?? '/api/contact';

const FIELD_ERRORS: Record<string, string> = {
  name: 'Add your name.',
  intent: 'Pick one of the two.',
  email: 'That email address does not look right.',
  message: 'Write a few words about what you need.',
};

type State = { step: 'idle' | 'sending' } | { step: 'sent'; name: string; email: string; height: number } | { step: 'failed'; limited: boolean };

/**
 * The contact form, written as a sentence with blanks. Without JavaScript it is a plain form post
 * to the contact service, which redirects to /thanks/; with it, it sends JSON and stays in place.
 */
export function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const done = useRef<HTMLHeadingElement>(null);
  const [state, setState] = useState<State>({ step: 'idle' });
  const [invalid, setInvalid] = useState<string[]>([]);

  // Native validation bubbles are the no-JS fallback; with JS the errors sit under the blanks.
  useEffect(() => {
    if (form.current) form.current.noValidate = true;
  }, []);

  useEffect(() => {
    if (state.step === 'sent') done.current?.focus();
  }, [state.step]);

  function showInvalid(names: string[]) {
    setInvalid(names);
    form.current?.querySelector<HTMLElement>(`[name="${names[0] ?? ''}"]`)?.focus();
  }

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.step === 'sending') return;
    const el = event.currentTarget;
    const local = Array.from(el.querySelectorAll<HTMLInputElement>(':invalid'), (f) => f.name);
    if (local.length) {
      showInvalid(local);
      return;
    }

    const data = Object.fromEntries(new FormData(el)) as Record<string, string>;
    setInvalid([]);
    setState({ step: 'sending' });
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        // The confirmation keeps the form's height so nothing below it moves.
        setState({ step: 'sent', name: data.name ?? '', email: data.email ?? '', height: el.offsetHeight });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { fields?: string[] };
      if (res.status === 400 && body.fields?.length) {
        setState({ step: 'idle' });
        showInvalid(body.fields);
        return;
      }
      setState({ step: 'failed', limited: res.status === 429 });
    } catch {
      setState({ step: 'failed', limited: false });
    }
  }

  if (state.step === 'sent') {
    return (
      <div className="cf cf-done lg:col-span-5 lg:col-start-8" style={{ minHeight: state.height }}>
        <h3 ref={done} tabIndex={-1} className="cf-say cf-thanks">
          Thanks, {state.name.trim().split(/\s+/)[0]}. Your message is with me.
        </h3>
        <p className="mt-3 max-w-[48ch] text-text-body">
          I will reply to {state.email}, usually the same day.
        </p>
      </div>
    );
  }

  const sending = state.step === 'sending';
  const blankProps = (name: string) => ({
    name,
    'aria-invalid': invalid.includes(name) || undefined,
    'aria-describedby': invalid.includes(name) ? `cf-${name}-error` : undefined,
  });

  return (
    <form ref={form} action={ENDPOINT} method="post" onSubmit={(e) => void submit(e)} className="cf lg:col-span-5 lg:col-start-8" aria-labelledby="cf-title">
      <h3 id="cf-title" className="sr-only">
        Send a message
      </h3>
      <p className="cf-say">
        Or write it here. I&rsquo;m{' '}
        <input
          className="cf-blank"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          placeholder="your name"
          aria-label="Your name"
          {...blankProps('name')}
        />{' '}
        and I&rsquo;m{' '}
        <select className="cf-blank cf-pick" aria-label="What it is about" defaultValue="hire" {...blankProps('intent')}>
          <option value="hire">hiring for a role</option>
          <option value="project">starting a project</option>
        </select>
        . Reach me at{' '}
        <input
          className="cf-blank"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={254}
          placeholder="your email"
          aria-label="Your email"
          {...blankProps('email')}
        />
        .
      </p>
      <div role="alert" className="cf-errors">
        {invalid
          .filter((name) => name !== 'message')
          .map((name) => (
            <p key={name} id={`cf-${name}-error`}>
              {FIELD_ERRORS[name] ?? 'Check this field.'}
            </p>
          ))}
      </div>
      <textarea className="cf-note" rows={4} required maxLength={5000} placeholder="What do you need?" aria-label="Message" {...blankProps('message')} />
      <div role="alert" className="cf-errors">
        {invalid.includes('message') && <p id="cf-message-error">{FIELD_ERRORS.message}</p>}
      </div>
      {/* Honeypot: people never see or reach it; bots that fill every field get a quiet 200. */}
      <div className="cf-trap" aria-hidden="true">
        <input name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <button type="submit" className="btn-primary cf-send" aria-disabled={sending || undefined}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
      <div role="status" className="cf-failed">
        {state.step === 'failed' && (
          <p>
            {state.limited ? 'That is more messages than I accept from one connection in an hour.' : 'Your message did not go through.'} What you wrote is
            still here. You can also email me at{' '}
            <a href={`mailto:${PROFILE.email}`} className="link text-text-primary">
              {PROFILE.email}
            </a>
            .
          </p>
        )}
      </div>
    </form>
  );
}
