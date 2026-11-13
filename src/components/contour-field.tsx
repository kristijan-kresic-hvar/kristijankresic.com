'use client';

import { useEffect, useRef } from 'react';
import { runField } from './hero/field-canvas';

/**
 * The depth chart of contour lines, live: it fills the positioned element it is placed in, drifts,
 * leans around the pointer and stays quiet behind the elements `text` selects inside that element.
 */
export function ContourField({ text, className }: { text: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const host = canvas.current?.parentElement;
    if (!canvas.current || !host) return;
    return runField(canvas.current, host, text);
  }, [text]);
  return <canvas ref={canvas} className={className} aria-hidden="true" />;
}
