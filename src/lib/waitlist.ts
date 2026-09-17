/**
 * The waitlist contract, shared by the form (client) and the route handler
 * (server). Nothing in here touches the environment or sends anything, so it
 * is safe on both sides; the mailer lives in lib/server/waitlist-mail.ts.
 */

/** Where on the page the signup came from. Shown in the owner's email. */
export const WAITLIST_SOURCES = ["newsletter", "footer"] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export interface WaitlistRequest {
  email: string;
  source: WaitlistSource;
  /**
   * Honeypot. Rendered off-screen, so people never fill it and form-filling
   * bots usually do. Anything in it and the request is quietly dropped.
   */
  company?: string;
}

export type WaitlistResponse = { ok: true } | { ok: false; error: string };

/** RFC 5321's limit on a whole address. */
const EMAIL_MAX_LENGTH = 254;

/*
  Deliberately permissive: one @, no whitespace, a dot in the domain. Stricter
  patterns reject real addresses; the real test of an address is whether the
  confirmation email arrives. The browser's own type="email" check runs first.
*/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** ASCII control characters (0-31 and DEL), which have no place in an address. */
function hasControlCharacter(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

/**
 * Trim and lowercase an address, or return null if it is not one. Control
 * characters are rejected outright, so nothing that could break a mail header
 * ever reaches the mailer.
 */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > EMAIL_MAX_LENGTH) return null;
  if (hasControlCharacter(email)) return null;
  return EMAIL_PATTERN.test(email) ? email : null;
}

export function isWaitlistSource(value: unknown): value is WaitlistSource {
  return (WAITLIST_SOURCES as readonly unknown[]).includes(value);
}
