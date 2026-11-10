'use client';

import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zagreb' });

/** Current time in Croatia, so a recruiter sees the overlap at a glance. Renders the zone only until hydrated. */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums" suppressHydrationWarning>
      {time ?? '--:--'} CET
    </span>
  );
}
