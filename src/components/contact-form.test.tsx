import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactForm } from './contact-form';
import { PROFILE } from '@/content/profile';

function reply(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

function fill() {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('What it is about'), { target: { value: 'project' } });
  fireEvent.change(screen.getByLabelText('Your email'), { target: { value: 'ana@example.com' } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'A new site.' } });
}

const send = () => fireEvent.click(screen.getByRole('button', { name: /Send/ }));

afterEach(() => vi.unstubAllGlobals());

describe('ContactForm', () => {
  it('posts natively to the contact endpoint when JavaScript is off', () => {
    render(<ContactForm />);
    const form = screen.getByRole('form', { name: 'Send a message' });
    expect(form).toHaveAttribute('action', '/api/contact');
    expect(form).toHaveAttribute('method', 'post');
    expect(screen.getByLabelText('Your email')).toHaveAttribute('type', 'email');
  });

  it('offers the intent as a choice between a role and a project', () => {
    render(<ContactForm />);
    const options = screen.getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(['hiring for a role', 'starting a project']);
  });

  it('sends the fields as JSON, shows progress once, then a confirmation that says what happens next', async () => {
    let finish: (r: Response) => void = () => {};
    const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(() => new Promise((r) => (finish = r)));
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm />);
    fill();
    send();
    expect(await screen.findByRole('button', { name: 'Sending…' })).toHaveAttribute('aria-disabled', 'true');
    send();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/contact');
    expect(JSON.parse(init?.body as string)).toEqual({
      name: 'Ana',
      intent: 'project',
      email: 'ana@example.com',
      message: 'A new site.',
      website: '',
    });

    await act(async () => finish(await reply(200, { ok: true })));
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Thanks, Ana/ })).toHaveFocus();
    expect(screen.getByText(/reply to ana@example.com/)).toBeInTheDocument();
  });

  it('puts the errors from a 400 at the fields they belong to and moves focus to the first', async () => {
    vi.stubGlobal('fetch', () => reply(400, { ok: false, error: 'invalid', fields: ['email', 'message'] }));
    render(<ContactForm />);
    fill();
    send();
    const email = screen.getByLabelText('Your email');
    await waitFor(() => expect(email).toHaveFocus());
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/email address does not look right/);
    expect(screen.getByLabelText('Message')).toHaveAccessibleDescription(/what you need/);
    expect(screen.getByLabelText('Your name')).not.toHaveAttribute('aria-invalid');
    expect(screen.getAllByRole('alert').map((a) => a.textContent).join(' ')).toMatch(/does not look right.*what you need/);
  });

  it('checks the blanks before sending anything', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<ContactForm />);
    send();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Your name')).toHaveFocus();
    expect(screen.getByLabelText('Your name')).toHaveAccessibleDescription('Add your name.');
  });

  it.each([
    ['the service fails', () => reply(502, { ok: false, error: 'send_failed' }), /did not go through/],
    ['the network is down', () => Promise.reject(new TypeError('Failed to fetch')), /did not go through/],
    ['the hourly limit is reached', () => reply(429, { ok: false, error: 'rate_limited' }), /in an hour/],
  ])('keeps everything typed and points to the address when %s', async (_, response, copy) => {
    vi.stubGlobal('fetch', response);
    render(<ContactForm />);
    fill();
    send();
    expect(await screen.findByRole('status')).toHaveTextContent(copy);
    expect(screen.getByRole('link', { name: PROFILE.email })).toHaveAttribute('href', `mailto:${PROFILE.email}`);
    expect(screen.getByLabelText('Your name')).toHaveValue('Ana');
    expect(screen.getByLabelText('Message')).toHaveValue('A new site.');
    expect(screen.getByRole('button', { name: 'Send message' })).not.toHaveAttribute('aria-disabled');
  });
});
