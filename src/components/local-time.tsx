'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const OPTIONS: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zagreb', timeZoneName: 'short' };
const fmt = new Intl.DateTimeFormat('en-GB', OPTIONS);
const noop = () => () => undefined;

/** Runs inline, right after the span is parsed: writes the time before the first paint, so hydration swaps nothing and the line never moves. */
function fillNow(script: Element | null, options: Intl.DateTimeFormatOptions) {
  const span = script?.previousElementSibling;
  if (span) span.textContent = new Intl.DateTimeFormat('en-GB', options).format(new Date());
}

/**
 * Current time in Croatia with its zone (CET in winter, CEST in summer), so a recruiter sees the
 * overlap at a glance. With scripts off it names the zone in words, which is right in summer and winter.
 */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  /** True only while hydrating server HTML: the inline script must not be rendered on the client. */
  const fromServer = useSyncExternalStore(
    noop,
    () => false,
    () => true,
  );
  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <>
      <span className="tabular-nums" suppressHydrationWarning>
        {time ?? 'Central European time'}
      </span>
      {fromServer && (
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(${fillNow.toString()})(document.currentScript,${JSON.stringify(OPTIONS)})` }} />
      )}
    </>
  );
}
