# Contact service

The contact form posts to `/api/contact`. nginx passes that path to a small Node service on the same VPS, and the service sends the message to you through Resend. The rest of the site stays a static export.

The service is one file, `server/contact.mjs`. It needs Node 22 or later and nothing from npm.

## What it does

- Accepts `POST /api/contact` as JSON or as a normal form post, with the fields `intent` (`hire` or `project`), `name`, `email`, `message` and `website`. `website` is a hidden trap field: real people leave it empty.
- Limits: body 10 KB, name 100 characters, email 254, message 5000.
- Sends one plain-text email with the subject `[Hire] <name>` or `[Project] <name>`. Replying to it goes to the sender.
- Allows 5 requests per client address per hour. The count is kept in memory, so it starts over when the service restarts.
- Only accepts requests whose `Origin` header is your site.
- Logs one line per request: time, client address, method, status and outcome. Never the message, name or email.

## 1. Set up Resend (once)

1. Sign in at resend.com.
2. Under Domains, add `kristijankresic.com` and create the DNS records it lists (SPF and DKIM, plus the MX record for the bounce subdomain) at your DNS provider. Wait until Resend shows the domain as verified.
3. Under API Keys, create a key with "Sending access" only, limited to that domain. Copy it now; Resend shows it once.

The sender address (`CONTACT_FROM`) must be on the verified domain, for example `Website <contact@kristijankresic.com>`. It does not need a real mailbox.

## 2. Copy the file to the VPS

```sh
ssh you@vps 'sudo mkdir -p /opt/kristijankresic-contact'
scp server/contact.mjs you@vps:/tmp/contact.mjs
ssh you@vps 'sudo mv /tmp/contact.mjs /opt/kristijankresic-contact/contact.mjs'
```

Check the Node version on the VPS with `node --version`. It must be 22 or later, and the unit expects it at `/usr/bin/node` (change `ExecStart` if `which node` says otherwise).

## 3. Write the environment file

On the VPS, create `/etc/kristijankresic/contact.env` with the values from `server/.env.example`:

```sh
sudo mkdir -p /etc/kristijankresic
sudo nano /etc/kristijankresic/contact.env
sudo chmod 600 /etc/kristijankresic/contact.env
```

```
RESEND_API_KEY=re_...
CONTACT_TO=you@yourmail.com
CONTACT_FROM=Website <contact@kristijankresic.com>
CONTACT_ORIGIN=https://kristijankresic.com
CONTACT_PORT=8787
```

`CONTACT_ORIGIN` is the exact address the site is served from, with no trailing slash. If the site also answers on `www.`, redirect that to one address in nginx, because only one origin is allowed.

The file is readable by root only. systemd reads it before starting the service, so the service itself never needs access to it.

## 4. Install the systemd unit

Copy `deploy/contact.service` from the repo:

```sh
scp deploy/contact.service you@vps:/tmp/
ssh you@vps
sudo mv /tmp/contact.service /etc/systemd/system/kristijankresic-contact.service
sudo systemctl daemon-reload
sudo systemctl enable --now kristijankresic-contact
sudo systemctl status kristijankresic-contact
```

The status should show `contact service on 127.0.0.1:8787`. If a variable is missing it stops with `Missing environment variables: ...` in the log. Read the log with:

```sh
journalctl -u kristijankresic-contact -n 50
```

The service listens on 127.0.0.1 only, so the only way in from outside is through nginx.

## 5. Add the nginx location

Paste `deploy/nginx-contact.conf` into the `server { ... }` block that serves the site over HTTPS, then:

```sh
sudo nginx -t && sudo systemctl reload nginx
```

nginx sets `X-Real-IP` to the address of whoever connected to it, overwriting anything the client sent. The service uses that header for the rate limit. If you ever put a CDN such as Cloudflare in front of the VPS, every request would then come from the CDN's addresses, and you would need nginx's `real_ip` settings so `$remote_addr` is the visitor again.

## 6. Try it

From your laptop. This sends a real email to `CONTACT_TO`:

```sh
curl -i https://kristijankresic.com/api/contact \
  -H 'Origin: https://kristijankresic.com' \
  -H 'Content-Type: application/json' \
  -d '{"intent":"project","name":"Test","email":"you@yourmail.com","message":"Testing the contact form.","website":""}'
```

Expect `HTTP/1.1 200` and `{"ok":true}`, then the email within a minute. Other answers:

| Status | Body | Meaning |
| --- | --- | --- |
| 400 | `{"ok":false,"error":"invalid","fields":[...]}` | The listed fields are missing, too long or malformed |
| 400 | `{"ok":false,"error":"invalid_body"}` | The body is not a JSON object |
| 403 | `{"ok":false,"error":"origin"}` | `Origin` header missing or not `CONTACT_ORIGIN` |
| 413 | `{"ok":false,"error":"too_large"}` | Body over 10 KB |
| 415 | `{"ok":false,"error":"content_type"}` | Neither JSON nor a form post |
| 429 | `{"ok":false,"error":"rate_limited"}` | More than 5 requests from this address in the last hour |
| 502 | `{"ok":false,"error":"send_failed"}` | Resend refused the message or took over 10 seconds. The reason is in the journal as `resend <status>` |

A form post (`-d 'intent=hire&name=...'` without the JSON header) gets a `303` redirect to `/thanks/` on success and to `/#contact` on any failure.

To check without sending an email, post an empty body. You should get the 400 with all four fields listed.

## Updating

Copy the new `contact.mjs` over the old one and run `sudo systemctl restart kristijankresic-contact`. Restarting clears the rate-limit counts.

## Local development

1. Copy `server/.env.example` to `server/.env` (it is git-ignored) and set `CONTACT_ORIGIN=http://localhost:3000` and `CONTACT_PORT=8787`. To try the form without a Resend key, add `CONTACT_DRY_RUN=1`: valid messages are answered as sent and nothing is emailed (the service refuses this setting unless the origin is localhost). Use a real Resend key only if you want real emails.
2. Run `npm run contact`. It listens on http://127.0.0.1:8787 and answers CORS preflight for http://localhost:3000.
3. Point the form at it: put `NEXT_PUBLIC_CONTACT_URL=http://127.0.0.1:8787/api/contact` in `.env.development.local` (git-ignored) and start `npm run dev`.

Without `NEXT_PUBLIC_CONTACT_URL` the form posts to `/api/contact` on the same host, which is what production uses.

The tests (`server/contact.test.ts`) run with `npm test` and never call Resend.
