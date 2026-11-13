// @vitest-environment node
import { createHandler, readConfig, BODY_LIMIT, type ContactRequest } from './contact.mjs';

const ORIGIN = 'https://site.test';
const config = { apiKey: 're_test', to: 'owner@site.test', from: 'Site <contact@site.test>', origin: ORIGIN, port: 0 };
const valid = { intent: 'hire', name: 'Ada Lovelace', email: 'ada@example.com', message: 'Hello there.', website: '' };

function setup(fetchImpl: typeof fetch = vi.fn(() => Promise.resolve(new Response('{}', { status: 200 })))) {
  const fetchMock = vi.fn(fetchImpl);
  const lines: string[] = [];
  const handle = createHandler(config, { fetch: fetchMock, log: (line) => lines.push(line) });
  return { handle, fetchMock, lines };
}

function json(body: unknown, headers: Record<string, string> = {}): ContactRequest {
  return {
    method: 'POST',
    path: '/api/contact',
    headers: { origin: ORIGIN, 'content-type': 'application/json', 'x-real-ip': '203.0.113.1', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

function form(fields: Record<string, string>): ContactRequest {
  return { ...json(''), headers: { origin: ORIGIN, 'content-type': 'application/x-www-form-urlencoded', 'x-real-ip': '203.0.113.2' }, body: new URLSearchParams(fields).toString() };
}

function sentPayload(fetchMock: ReturnType<typeof setup>['fetchMock']) {
  const init = fetchMock.mock.calls[0]?.[1];
  return JSON.parse(init?.body as string) as Record<string, unknown>;
}

describe('contact service', () => {
  it('sends one plain-text email for a valid JSON request', async () => {
    const { handle, fetchMock } = setup();
    const res = await handle(json(valid));
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    expect(res.headers['access-control-allow-origin']).toBe(ORIGIN);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.resend.com/emails');
    expect(sentPayload(fetchMock)).toEqual({
      from: config.from,
      to: [config.to],
      reply_to: 'ada@example.com',
      subject: '[Hire] Ada Lovelace',
      text: 'Hello there.\n\n-- \nAda Lovelace\nada@example.com\n',
    });
  });

  it('uses the Project subject for project intent', async () => {
    const { handle, fetchMock } = setup();
    await handle(json({ ...valid, intent: 'project' }));
    expect(sentPayload(fetchMock).subject).toBe('[Project] Ada Lovelace');
  });

  it('rejects invalid fields with 400 and names each one', async () => {
    const { handle, fetchMock } = setup();
    const res = await handle(json({ intent: 'spam', name: 'x'.repeat(101), email: 'not-an-email', message: ' ' }));
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ ok: false, error: 'invalid', fields: ['intent', 'name', 'email', 'message'] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enforces the length limits at the boundary', async () => {
    const { handle } = setup();
    const atLimit = { ...valid, name: 'n'.repeat(100), email: `${'a'.repeat(242)}@example.com`, message: 'm'.repeat(5000) };
    expect((await handle(json(atLimit))).status).toBe(200);
    const res = await handle(json({ ...atLimit, email: `a${atLimit.email}`, message: 'm'.repeat(5001) }));
    expect(JSON.parse(res.body)).toMatchObject({ fields: ['email', 'message'] });
  });

  it('rejects non-string fields, malformed JSON and other content types', async () => {
    const { handle } = setup();
    expect(JSON.parse((await handle(json({ ...valid, name: ['Ada'] }))).body)).toMatchObject({ fields: ['name'] });
    expect((await handle(json('{nope'))).status).toBe(400);
    expect((await handle(json('[1]'))).status).toBe(400);
    expect((await handle(json('hi', { 'content-type': 'text/plain' }))).status).toBe(415);
  });

  it('rejects bodies over 10 KB', async () => {
    const { handle, fetchMock } = setup();
    const res = await handle(json({ ...valid, message: 'x'.repeat(BODY_LIMIT) }));
    expect(res.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ['name', { name: 'Ada\r\nBcc: victim@example.com' }],
    ['name', { name: 'Ada\nX' }],
    ['name', { name: 'Ada\u2028Bcc: victim@example.com' }],
    ['name', { name: 'Ada\u2029X' }],
    ['email', { email: 'ada@example.com\u2028Bcc: victim@example.com' }],
    ['email', { email: 'ada@example.com\r\nBcc: victim@example.com' }],
    ['email', { email: 'ada@example.com, victim@example.com' }],
    ['email', { email: 'Ada <ada@example.com>' }],
  ])('refuses header or recipient injection in %s', async (field, patch) => {
    const { handle, fetchMock } = setup();
    const res = await handle(json({ ...valid, ...patch }));
    expect(res.status).toBe(400);
    expect(JSON.parse(res.body)).toMatchObject({ fields: [field] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers a filled honeypot with 200 and sends nothing', async () => {
    const { handle, fetchMock, lines } = setup();
    const res = await handle(json({ ...valid, website: 'http://spam.test' }));
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(lines[0]).toContain('honeypot');
  });

  it('allows 5 requests per client address an hour, then 429', async () => {
    let t = 0;
    const fetchMock = vi.fn(() => Promise.resolve(new Response('{}')));
    const handle = createHandler(config, { fetch: fetchMock, now: () => t, log: () => undefined });
    for (let i = 0; i < 5; i++) expect((await handle(json(valid))).status).toBe(200);
    expect((await handle(json(valid))).status).toBe(429);
    expect((await handle(json(valid, { 'x-real-ip': '198.51.100.9' }))).status).toBe(200);
    t += 60 * 60 * 1000 + 1;
    expect((await handle(json(valid))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(7);
  });

  it('refuses other origins and a missing origin', async () => {
    const { handle, fetchMock } = setup();
    expect((await handle(json(valid, { origin: 'https://evil.test' }))).status).toBe(403);
    expect((await handle(json(valid, { origin: '' }))).status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers CORS preflight for the allowed origin only', async () => {
    const { handle } = setup();
    const res = await handle({ ...json(''), method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers).toMatchObject({ 'access-control-allow-origin': ORIGIN, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'Content-Type' });
    expect((await handle({ ...json('', { origin: 'https://evil.test' }), method: 'OPTIONS' })).status).toBe(403);
  });

  it('answers 404 for other paths and 405 for other methods', async () => {
    const { handle } = setup();
    expect((await handle({ ...json(valid), path: '/api/other' })).status).toBe(404);
    expect((await handle({ ...json(valid), method: 'GET' })).status).toBe(405);
  });

  it('redirects form posts to /thanks/ on success and /#contact on failure', async () => {
    const { handle, fetchMock } = setup();
    const ok = await handle(form(valid));
    expect(ok).toMatchObject({ status: 303, headers: { location: `${ORIGIN}/thanks/` } });
    expect(sentPayload(fetchMock).subject).toBe('[Hire] Ada Lovelace');
    const bad = await handle(form({ ...valid, email: 'nope' }));
    expect(bad).toMatchObject({ status: 303, headers: { location: `${ORIGIN}/#contact` } });
  });

  it('answers 502 without leaking Resend errors', async () => {
    const { handle } = setup(() => Promise.resolve(new Response('{"message":"API key re_secret invalid"}', { status: 401 })));
    const res = await handle(json(valid));
    expect(res.status).toBe(502);
    expect(JSON.parse(res.body)).toEqual({ ok: false, error: 'send_failed' });
    const down = setup(() => Promise.reject(new TypeError('fetch failed')));
    expect((await down.handle(json(valid))).status).toBe(502);
  });

  it('gives up on Resend after 10 seconds with 502', async () => {
    vi.useFakeTimers();
    try {
      const { handle } = setup((_url, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => { reject(new DOMException('aborted', 'AbortError')); });
      }));
      const pending = handle(json(valid));
      await vi.advanceTimersByTimeAsync(9_999);
      let settled = false;
      void pending.then(() => { settled = true; });
      await vi.advanceTimersByTimeAsync(0);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect((await pending).status).toBe(502);
    } finally {
      vi.useRealTimers();
    }
  });

  it('logs one line per request without message content', async () => {
    const { handle, lines } = setup();
    await handle(json(valid));
    await handle(json({ ...valid, email: 'bad' }));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/203\.0\.113\.1 POST 200 sent$/);
    for (const line of lines) {
      expect(line).not.toContain('Hello there');
      expect(line).not.toContain('ada@example.com');
      expect(line).not.toContain('Ada');
    }
  });

  it('refuses to start when a required variable is missing', () => {
    expect(() => readConfig({ RESEND_API_KEY: 'x', CONTACT_ORIGIN: ORIGIN })).toThrow('Missing environment variables: CONTACT_TO, CONTACT_FROM');
    expect(readConfig({ RESEND_API_KEY: 'k', CONTACT_TO: 't', CONTACT_FROM: 'f', CONTACT_ORIGIN: 'o' }).port).toBe(8787);
  });

  it('in a dry run answers as sent without calling Resend, and only for a site on this machine', async () => {
    expect(() => readConfig({ CONTACT_DRY_RUN: '1', CONTACT_ORIGIN: ORIGIN })).toThrow('local work only');
    const local = readConfig({ CONTACT_DRY_RUN: '1', CONTACT_ORIGIN: 'http://localhost:3000' });
    const fetchMock = vi.fn();
    const lines: string[] = [];
    const handle = createHandler(local, { fetch: fetchMock, log: (line) => lines.push(line) });
    const res = await handle(json(valid, { origin: 'http://localhost:3000' }));
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(lines.at(-1)).toContain('dry run, nothing sent');
    // invalid input is still refused, so the form's error states can be tried too
    expect((await handle(json({ ...valid, email: 'nope' }, { origin: 'http://localhost:3000' }))).status).toBe(400);
  });
});
