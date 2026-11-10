import { PROFILE } from '@/content/profile';

const plain = PROFILE.name.normalize('NFD').replace(/\p{M}/gu, '');

/**
 * The name at poster scale with only its diacritics in amber (see `.namemark` in globals.css).
 * Sized from its container in globals.css so it always spans the page frame.
 */
export function NameMark({ className = '' }: { className?: string }) {
  return (
    <div className={`overflow-x-clip [container-type:inline-size] ${className}`}>
      <span
        role="img"
        aria-label={PROFILE.name}
        className="namemark leading-[0.82] font-semibold tracking-tighter"
      >
        <span aria-hidden="true">{PROFILE.name}</span>
        <span aria-hidden="true">{plain}</span>
      </span>
    </div>
  );
}
