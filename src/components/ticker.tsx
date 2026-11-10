/** Slow mono marquee of client → what I built. CSS-only; pauses on hover; static wrap under reduced motion. */
export function Ticker({ items }: { items: { client: string; built: string }[] }) {
  const row = (ariaHidden: boolean) => (
    <ul aria-hidden={ariaHidden} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((it) => (
        <li key={it.client} className="flex items-center gap-3 whitespace-nowrap font-mono text-xs uppercase tracking-wide">
          <span className="text-text-secondary">{it.client}</span>
          <span className="text-accent" aria-hidden="true">
            →
          </span>
          <span className="text-text-muted">{it.built}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="ticker border-y border-border-subtle bg-bg-elev-1 py-3" aria-label="Clients and what I built for them">
      <div className="ticker-track flex">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
