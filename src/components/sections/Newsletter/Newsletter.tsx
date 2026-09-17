import { EmailSignup } from "@/components/ui/EmailSignup";

import { PhoneStack } from "./PhoneStack";

/**
 * THE INVITE BANNER.
 *
 * The close of the page: the one lit, opaque surface on a site built out of
 * dark glass. Everything above lets the DNA field read through it; this panel
 * stops it, which is what makes the section read as an end rather than
 * another beat.
 *
 * The email field posts to /api/waitlist, which emails the owner and sends
 * the visitor a confirmation — see `EmailSignup`. The CTA keeps the label
 * the header already uses, because the page should ask for the same thing in
 * the same words every time it asks.
 *
 * **Not a client component.** The four reveals are AOS, the type is utilities,
 * and the only interactive parts — the CTA and the phone fan — are client
 * components of their own. So this section ships no JavaScript itself. That is
 * the whole reason AOS earns its place here: it is the one section where a
 * declarative reveal removes a `"use client"` boundary rather than adding a
 * second animation system beside Framer.
 *
 * The panel, the arcs and the phone fan stay in newsletter.css — see there.
 */
export function Newsletter() {
  return (
    <section
      className="relative z-10 px-[var(--container-gutter)] pt-[clamp(56px,8vh,112px)] pb-0"
      id="newsletter"
      aria-labelledby="newsletter-title"
    >
      {/* The panel settles in first; its copy rises inside it just after. */}
      <div className="newsletter-panel" data-aos="knocka-zoom">
        {/* Concentric arcs rising out of the bottom-left corner — the DNA
            strand's curve, held still and used as furniture. */}
        <span className="newsletter-arcs" aria-hidden="true">
          <span className="newsletter-arc-fill" />
          <span className="newsletter-arc-ring" />
          <span className="newsletter-arc-ring newsletter-arc-ring-wide" />
        </span>

        <div className="relative z-[2] max-w-[clamp(280px,46vw,560px)]">
          {/* delay-* utilities rather than data-aos-delay: AOS's delay rules
              live in the stylesheet we deliberately do not import. */}
          <p
            data-aos="knocka-rise"
            className="mb-[clamp(14px,1.3vw,20px)] text-caption font-medium tracking-[0.22em] text-accent-lilac uppercase"
          >
            Get early access
          </p>

          {/* font-[900] rather than a named weight: --font-weight-display and
              --font-display (the family) would both generate `font-display`. */}
          <h2
            data-aos="knocka-heading"
            className="font-display text-[clamp(30px,4.6vw,54px)]/[0.94] font-[900] tracking-[-0.042em] text-balance uppercase delay-[60ms]"
            id="newsletter-title"
          >
            Start knocking.
          </h2>

          {/* White at reduced alpha, not text-text-secondary: the slate token
              is mixed for the dark page and turns grey-blue on purple. */}
          <p
            data-aos="knocka-rise"
            className="mt-[clamp(16px,1.6vw,26px)] max-w-[40ch] text-[clamp(14px,1.05vw,17px)]/[1.6] text-[rgba(255,255,255,0.74)] text-balance delay-[120ms]"
          >
            Knocka opens in waves. Join the waitlist and be one of the first to
            send a face, a voice and a knock instead of another grey bubble.
          </p>

          <div
            data-aos="knocka-rise"
            className="mt-[clamp(24px,2.2vw,36px)] flex flex-col gap-3.5 delay-[180ms]"
          >
            <EmailSignup
              label="Your email address"
              buttonLabel="Join the Waitlist"
              className="max-w-[clamp(280px,34vw,470px)]"
            />
            <p className="text-[11px] tracking-[0.16em] text-[rgba(255,255,255,0.5)] uppercase">
              Coming soon to iOS and Android
            </p>
          </div>
        </div>

        <PhoneStack />
      </div>
    </section>
  );
}
