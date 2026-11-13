import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { LocalTime } from './local-time';

describe('LocalTime', () => {
  it('shows the zone alone before hydration, so the page is complete without scripts', () => {
    expect(renderToString(<LocalTime />)).toContain('>CET<');
  });

  it('shows the current Croatian time with its zone once mounted', () => {
    render(<LocalTime />);
    expect(screen.getByText(/^\d{2}:\d{2} \S+$/)).toBeInTheDocument();
  });
});
