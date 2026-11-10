'use client';

import { useState } from 'react';

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  }

  return (
    <button type="button" onClick={copy} aria-live="polite" data-state={state} className="btn-secondary">
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select to copy' : label}
    </button>
  );
}
