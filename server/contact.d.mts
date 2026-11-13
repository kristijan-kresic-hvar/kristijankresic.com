/** Types for contact.mjs so the TypeScript tests can import it (the project does not type-check JS). */
export interface ContactConfig {
  apiKey: string;
  to: string;
  from: string;
  origin: string;
  port: number;
  /** Answer as if sent without calling Resend. Local work only. */
  dryRun?: boolean;
}

export interface ContactRequest {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string;
  remoteAddress?: string;
}

export interface ContactResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface ContactDeps {
  fetch?: typeof fetch;
  now?: () => number;
  log?: (line: string) => void;
}

export const BODY_LIMIT: number;
export function readConfig(env: Record<string, string | undefined>): ContactConfig;
export function createHandler(config: ContactConfig, deps?: ContactDeps): (req: ContactRequest) => Promise<ContactResponse>;
export function start(config: ContactConfig): import('node:http').Server;
