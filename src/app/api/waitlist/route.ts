import type { NextRequest } from "next/server";

import { getMailConfig, sendWaitlistEmails } from "@/lib/server/waitlist-mail";
import {
  isWaitlistSource,
  normalizeEmail,
  type WaitlistResponse,
} from "@/lib/waitlist";

/**
 * POST /api/waitlist — { email, source, company? } -> { ok } | { ok, error }
 *
 * Checks run cheapest first: rate limit, body size, honeypot, address, mail
 * settings, and only then the SMTP round trip. Error messages are written for
 * the visitor, because the form shows them as they are; the detail a
 * developer needs goes to the server log instead.
 *
 * Runs on the Node.js runtime, the default — Nodemailer needs raw sockets.
 */

const MAX_BODY_BYTES = 2_000;

/*
  Five attempts per address per ten minutes. Kept in memory, so it is per
  server instance: it stops a script hammering one process, not a
  distributed attack. Behind several instances, move this to a shared store
  (Redis, Upstash) or the platform's own rate limiting.
*/
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string, now: number): boolean {
  // Drop expired windows so the map cannot grow without bound.
  if (attempts.size > 5_000) {
    for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

/** The first hop in x-forwarded-for is the visitor; the rest are proxies. */
function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function reply(body: WaitlistResponse, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: NextRequest) {
  if (isRateLimited(clientKey(request), Date.now())) {
    return reply(
      { ok: false, error: "Too many attempts. Please try again in a few minutes." },
      429,
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return reply({ ok: false, error: "That request was too large." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ ok: false, error: "Something went wrong. Please try again." }, 400);
  }

  // Honeypot filled: answer exactly like a success so the bot learns
  // nothing, and send nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return reply({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return reply({ ok: false, error: "Please enter a valid email address." }, 400);
  }
  const source = isWaitlistSource(body.source) ? body.source : "newsletter";

  const settings = getMailConfig();
  if (!settings.ok) {
    console.error(
      `[waitlist] Not configured — missing ${settings.missing.join(", ")}. See .env.example.`,
    );
    return reply(
      { ok: false, error: "Signups are paused for a moment. Please try again later." },
      503,
    );
  }

  try {
    await sendWaitlistEmails(settings.config, {
      email,
      source,
      userAgent: request.headers.get("user-agent"),
      at: new Date(),
    });
  } catch (error) {
    console.error(`[waitlist] Could not record signup for ${email}.`, error);
    return reply(
      { ok: false, error: "We couldn't add you just now. Please try again in a minute." },
      502,
    );
  }

  return reply({ ok: true });
}
