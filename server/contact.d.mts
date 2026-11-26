/** Types for contact.mjs so the TypeScript tests can import it (the project does not type-check JS). */
export interface ContactConfig {
  apiKey: string;
  to: string;
  from: string;
  /** Site addresses allowed to post. Failed form posts from anywhere else go back to the first. */
  origins: string[];
  port: number;
  /** Address to listen on. Default 127.0.0.1. */
  host?: string;
  /** Lower-case name of the header the proxy sets to the visitor's address. Default x-real-ip. */
  ipHeader?: string;
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
