'use client';

import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zagreb', timeZoneName: 'short' });

/**
 * Current time in Croatia with its zone (CET in winter, CEST in summer), so a recruiter sees the
 * overlap at a glance. Before hydration, and with scripts off, it shows the zone alone.
 */
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time ?? 'CET'}</span>;
}
