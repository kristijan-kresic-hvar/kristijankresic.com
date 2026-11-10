import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NameMark } from './name-mark';
import { PROFILE } from '@/content/profile';

describe('NameMark', () => {
  it('reads as the name once, however many layers draw it', () => {
    render(<NameMark />);
    const mark = screen.getByRole('img', { name: PROFILE.name });
    expect(mark.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });

  it('stacks the full name under a copy without diacritics, so only the marks show in amber', () => {
    render(<NameMark />);
    const [amber, light] = screen.getByRole('img').children;
    expect(amber).toHaveTextContent('Kristijan Krešić');
    expect(light).toHaveTextContent('Kristijan Kresic');
    expect(light?.textContent).toHaveLength(amber?.textContent?.length ?? 0);
  });
});
