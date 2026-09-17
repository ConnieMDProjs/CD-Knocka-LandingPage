import "server-only";

import { createTransport, type Transporter } from "nodemailer";

import { siteConfig } from "@/lib/site-config";
import type { WaitlistSource } from "@/lib/waitlist";

/**
 * Waitlist email over SMTP, via Nodemailer.
 *
 * Every setting comes from the environment (see .env.example), so the same
 * code sends through Gmail today and any other SMTP provider — Resend, Brevo,
 * SES, Postmark — tomorrow by changing four variables, not code.
 *
 * `server-only` makes importing this from a Client Component a build error:
 * it holds the SMTP password.
 */

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  /** Receives one notification per signup. */
  owner: string;
}

export type MailConfigResult =
  | { ok: true; config: MailConfig }
  | { ok: false; missing: string[] };

const REQUIRED = [
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "WAITLIST_OWNER_EMAIL",
] as const;

/**
 * Read and check the mail settings. Read per request rather than at module
 * load, so a missing variable is reported where it matters (the signup that
 * failed) instead of crashing the server at boot.
 */
export function getMailConfig(): MailConfigResult {
  const env = process.env;
  const missing = REQUIRED.filter((key) => !env[key]?.trim());
  if (missing.length > 0) return { ok: false, missing };

  const host = env.SMTP_HOST!.trim();
  const user = env.SMTP_USER!.trim();
  const port = Number(env.SMTP_PORT?.trim() || 465);
  // Port 465 is implicit TLS; 587 and 25 upgrade with STARTTLS instead.
  const secure = env.SMTP_SECURE
    ? env.SMTP_SECURE.trim() === "true"
    : port === 465;

  let pass = env.SMTP_PASS!.trim();
  // Google displays App Passwords in four groups of four. Pasted as shown,
  // the spaces would make the login fail; the real password never has any.
  if (host === "smtp.gmail.com") pass = pass.replace(/\s+/g, "");

  return {
    ok: true,
    config: {
      host,
      port,
      secure,
      user,
      pass,
      from: env.MAIL_FROM?.trim() || `"${siteConfig.name}" <${user}>`,
      owner: env.WAITLIST_OWNER_EMAIL!.trim(),
    },
  };
}

/**
 * One transporter per settings, reused across requests. Rebuilt only if the
 * settings change, which in development happens when .env.local is edited.
 */
let cached: { key: string; transporter: Transporter } | null = null;

function transporterFor(config: MailConfig): Transporter {
  const key = [config.host, config.port, config.secure, config.user, config.pass].join("|");
  if (cached?.key === key) return cached.transporter;

  const transporter = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // Fail within seconds rather than leaving the visitor's button spinning
    // on an SMTP server that is not answering.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  cached = { key, transporter };
  return transporter;
}

export interface Signup {
  email: string;
  source: WaitlistSource;
  userAgent: string | null;
  at: Date;
}

/**
 * Send the owner's notification and the visitor's confirmation, in parallel.
 *
 * Only the owner's message is load-bearing: with no database behind the
 * waitlist, that email IS the record of the signup, so if it fails the whole
 * signup fails and the visitor is asked to try again. A failed confirmation
 * is logged and the signup still counts — the owner has the address.
 */
export async function sendWaitlistEmails(
  config: MailConfig,
  signup: Signup,
): Promise<void> {
  const transporter = transporterFor(config);

  const [owner, confirmation] = await Promise.allSettled([
    transporter.sendMail({
      from: config.from,
      to: config.owner,
      // Replying to the notification writes straight to the new signup.
      replyTo: signup.email,
      subject: `New ${siteConfig.name} waitlist signup: ${signup.email}`,
      ...ownerMessage(signup),
    }),
    transporter.sendMail({
      from: config.from,
      to: signup.email,
      replyTo: config.owner,
      subject: `You're on the ${siteConfig.name} waitlist`,
      ...confirmationMessage(signup),
    }),
  ]);

  if (owner.status === "rejected") throw owner.reason;
  if (confirmation.status === "rejected") {
    console.error(
      `[waitlist] Confirmation to ${signup.email} failed; the signup was still recorded.`,
      confirmation.reason,
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Messages                                                           */
/* ------------------------------------------------------------------ */

/** Everything interpolated into HTML goes through this. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SOURCE_LABEL: Record<WaitlistSource, string> = {
  newsletter: "Invite banner (Start knocking)",
  footer: "Footer",
};

function ownerMessage(signup: Signup) {
  const when = signup.at.toUTCString();
  const rows: [string, string][] = [
    ["Email", signup.email],
    ["Signed up from", SOURCE_LABEL[signup.source]],
    ["Time", when],
    ["Browser", signup.userAgent ?? "Unknown"],
  ];

  const text = [
    `New ${siteConfig.name} waitlist signup`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Reply to this email to write to them directly.",
  ].join("\n");

  const html = layout(`
    <h1 style="margin:0 0 20px;font-size:22px;line-height:1.2;color:#ffffff;">New waitlist signup</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows
        .map(
          ([label, value]) => `
      <tr>
        <td style="padding:10px 0;border-top:1px solid #26203a;color:#94a3b8;font-size:13px;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:10px 0;border-top:1px solid #26203a;color:#f1f5f9;font-size:14px;word-break:break-word;">${escapeHtml(value)}</td>
      </tr>`,
        )
        .join("")}
    </table>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">Reply to this email to write to them directly.</p>
  `);

  return { text, html };
}

function confirmationMessage(signup: Signup) {
  const name = siteConfig.name;

  const text = [
    "You're on the list.",
    "",
    `Thanks for joining the ${name} waitlist. ${name} opens in waves, and we'll knock when yours opens.`,
    "",
    "There's nothing else to do until then. We'll only email you about your invite.",
    "",
    `You're getting this because ${signup.email} was added to the ${name} waitlist. If that wasn't you, you can ignore this email.`,
  ].join("\n");

  const html = layout(`
    <p style="margin:0 0 14px;color:#d8b4fe;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;">Early access</p>
    <h1 style="margin:0 0 18px;font-size:30px;line-height:1.05;color:#ffffff;text-transform:uppercase;letter-spacing:-0.02em;">You're on the list.</h1>
    <p style="margin:0 0 14px;color:#cbd5e1;font-size:15px;line-height:1.6;">
      Thanks for joining the ${escapeHtml(name)} waitlist. ${escapeHtml(name)} opens in waves, and we'll knock when yours opens.
    </p>
    <p style="margin:0;color:#cbd5e1;font-size:15px;line-height:1.6;">
      There's nothing else to do until then. We'll only email you about your invite.
    </p>
    <p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #26203a;color:#64748b;font-size:12px;line-height:1.6;">
      You're getting this because ${escapeHtml(signup.email)} was added to the ${escapeHtml(name)} waitlist. If that wasn't you, you can ignore this email.
    </p>
  `);

  return { text, html };
}

/**
 * The shared shell: a dark card with the brand gradient along the top.
 * Table layout and inline styles only — email clients ignore most CSS.
 */
function layout(body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#030305;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#030305;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0e0b16;border:1px solid #26203a;border-radius:18px;overflow:hidden;">
            <tr><td style="height:4px;background:#a855f7;background-image:linear-gradient(90deg,#a855f7,#ec4899,#38bdf8);"></td></tr>
            <tr>
              <td style="padding:32px 32px 36px;">
                <p style="margin:0 0 26px;font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:-0.01em;">${escapeHtml(siteConfig.name)}</p>
                ${body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
