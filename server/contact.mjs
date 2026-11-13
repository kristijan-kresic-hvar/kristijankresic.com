// Contact endpoint: POST /api/contact -> one email through Resend.
// Runs as `node server/contact.mjs` on Node 22 with no dependencies. Setup: docs/contact-service.md.
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

export const BODY_LIMIT = 10 * 1024;
const LIMITS = { name: 100, email: 254, message: 5000 };
const RATE_MAX = 5;
const RATE_WINDOW = 60 * 60 * 1000;
const RESEND_TIMEOUT = 10_000;
const REQUIRED = ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'CONTACT_ORIGIN'];
// No whitespace, commas, semicolons or angle brackets, so one address and nothing else.
const EMAIL = /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/;
const CONTROL = /[\u0000-\u001f\u007f]/;

/** Reads the config from the environment; throws naming every missing variable. */
export function readConfig(env) {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  return {
    apiKey: env.RESEND_API_KEY,
    to: env.CONTACT_TO,
    from: env.CONTACT_FROM,
    origin: env.CONTACT_ORIGIN,
    port: Number(env.CONTACT_PORT || 8787),
  };
}

function validate(data) {
  const fields = [];
  const text = (key) => (typeof data[key] === 'string' ? data[key].trim() : null);
  const intent = data.intent;
  const name = text('name');
  const email = text('email');
  const message = text('message');
  if (intent !== 'hire' && intent !== 'project') fields.push('intent');
  if (!name || name.length > LIMITS.name || CONTROL.test(name)) fields.push('name');
  if (!email || email.length > LIMITS.email || CONTROL.test(email) || !EMAIL.test(email)) fields.push('email');
  if (!message || message.length > LIMITS.message) fields.push('message');
  return { fields, value: { intent, name, email, message } };
}

function parseBody(contentType, body) {
  if (contentType === 'application/x-www-form-urlencoded') return Object.fromEntries(new URLSearchParams(body));
  try {
    const data = JSON.parse(body);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/**
 * Builds the request handler. It never touches the network itself except through `deps.fetch`,
 * so tests call it directly. The rate limit lives in this closure (in memory; it resets on restart).
 */
export function createHandler(config, deps = {}) {
  const { fetch: send = globalThis.fetch, now = Date.now, log = console.log } = deps;
  const hits = new Map();

  function limited(ip) {
    const t = now();
    if (hits.size > 1000) for (const [key, times] of hits) if (times.at(-1) <= t - RATE_WINDOW) hits.delete(key);
    const times = (hits.get(ip) ?? []).filter((at) => at > t - RATE_WINDOW);
    times.push(t);
    hits.set(ip, times);
    return times.length > RATE_MAX;
  }

  async function deliver(v) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT);
    try {
      const res = await send('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: config.from,
          to: [config.to],
          reply_to: v.email,
          subject: `[${v.intent === 'hire' ? 'Hire' : 'Project'}] ${v.name}`,
          text: `${v.message}\n\n-- \n${v.name}\n${v.email}\n`,
        }),
        signal: controller.signal,
      });
      return res.ok ? 'sent' : `resend ${res.status}`;
    } catch (error) {
      return controller.signal.aborted ? 'resend timeout' : `resend error ${error?.name ?? ''}`.trim();
    } finally {
      clearTimeout(timer);
    }
  }

  /** @param {{ method: string, path: string, headers: Record<string, string | undefined>, body: string, remoteAddress?: string }} req */
  return async function handle(req) {
    const ip = req.headers['x-real-ip'] || req.remoteAddress || 'unknown';
    const cors = { 'access-control-allow-origin': config.origin, vary: 'Origin' };
    const contentType = (req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
    const isForm = contentType === 'application/x-www-form-urlencoded';

    const reply = (status, outcome, payload) => {
      log(`${new Date(now()).toISOString()} ${ip} ${req.method} ${status} ${outcome}`);
      // JavaScript off: always send the browser back to the site, never to a bare JSON page.
      if (isForm) {
        const location = `${config.origin}${payload.ok ? '/thanks/' : '/#contact'}`;
        return { status: 303, headers: { ...cors, location }, body: '' };
      }
      return { status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(payload) };
    };

    if (req.path !== '/api/contact') return reply(404, 'not found', { ok: false, error: 'not_found' });
    if (req.headers.origin !== config.origin) return reply(403, 'bad origin', { ok: false, error: 'origin' });
    if (req.method === 'OPTIONS') {
      log(`${new Date(now()).toISOString()} ${ip} OPTIONS 204 preflight`);
      return {
        status: 204,
        headers: { ...cors, 'access-control-allow-methods': 'POST', 'access-control-allow-headers': 'Content-Type', 'access-control-max-age': '86400' },
        body: '',
      };
    }
    if (req.method !== 'POST') return reply(405, 'bad method', { ok: false, error: 'method' });
    if (limited(ip)) return reply(429, 'rate limited', { ok: false, error: 'rate_limited' });
    if (Buffer.byteLength(req.body) > BODY_LIMIT) return reply(413, 'too large', { ok: false, error: 'too_large' });
    if (!isForm && contentType !== 'application/json') return reply(415, 'bad content type', { ok: false, error: 'content_type' });

    const data = parseBody(contentType, req.body);
    if (!data) return reply(400, 'bad body', { ok: false, error: 'invalid_body' });
    // Bots fill every field; answer as if sent so they learn nothing.
    if (data.website !== undefined && data.website !== '') return reply(200, 'honeypot', { ok: true });

    const { fields, value } = validate(data);
    if (fields.length) return reply(400, `invalid ${fields.join(',')}`, { ok: false, error: 'invalid', fields });

    const outcome = await deliver(value);
    return outcome === 'sent' ? reply(200, 'sent', { ok: true }) : reply(502, outcome, { ok: false, error: 'send_failed' });
  };
}

function readBody(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    stream.on('data', (chunk) => {
      // Buffer until past the limit (the handler then sees it is too large), drop the rest.
      if (size <= BODY_LIMIT) chunks.push(chunk);
      size += chunk.length;
    });
    stream.on('end', () => resolve(Buffer.concat(chunks).subarray(0, BODY_LIMIT + 1).toString('utf8')));
    stream.on('error', reject);
  });
}

export function start(config) {
  const handle = createHandler(config);
  const server = createServer(async (req, res) => {
    try {
      const body = await readBody(req);
      const url = new URL(req.url ?? '/', 'http://localhost');
      const out = await handle({ method: req.method ?? '', path: url.pathname, headers: req.headers, body, remoteAddress: req.socket.remoteAddress });
      res.writeHead(out.status, out.headers).end(out.body);
    } catch (error) {
      console.error(`${new Date().toISOString()} handler error ${error?.name ?? ''}`);
      if (!res.headersSent) res.writeHead(500, { 'content-type': 'application/json' }).end('{"ok":false,"error":"server"}');
    }
  });
  server.requestTimeout = 15_000;
  // Loopback only: nginx is the sole way in, so the X-Real-IP it sets cannot be forged from outside.
  server.listen(config.port, '127.0.0.1', () => console.log(`contact service on 127.0.0.1:${config.port}, origin ${config.origin}`));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    start(readConfig(process.env));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
