import Image from "next/image";

import { EmailSignup } from "@/components/ui/EmailSignup";
import { footerGroups, siteConfig, socialGroup } from "@/lib/site-config";

import { StoreBadges } from "./StoreBadges";

const WORDMARK = "Knocka";
const LINK_COLUMNS = [...footerGroups, socialGroup];

/**
 * `group` on the anchor is what replaces the two `a:hover span` descendant
 * rules: the nudge is declared on the thing that moves, next to the thing
 * that triggers it. Both states are spelled out rather than using the
 * `interact` variant, because `interact` is a selector variant and does not
 * compose onto `group-*`.
 */
const LINK =
  "group inline-block text-[14px] text-text-secondary no-underline " +
  "transition-[color] duration-[220ms] ease-[ease] interact:text-text-primary";

/**
 * A server component: every reveal is AOS, and the only interactive parts —
 * the email field and the store badges — are client components of their
 * own. Back-to-top used to sit in the bottom row; it is now the floating
 * BackToTop control, reachable from anywhere below the hero.
 */
export function Footer() {
  return (
    <footer className="relative z-10 px-[var(--container-gutter)] pt-[clamp(40px,6vw,80px)]">
      {/* The panel keeps its stylesheet rule: it owns --footer-pad, which the
          wordmark cancels with a negative margin, and the cqw container the
          wordmark is sized against. See footer.css. */}
      <div className="site-footer-panel">
        <div className="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.45fr)] gap-[clamp(36px,5vw,72px)] upto-900:grid-cols-[minmax(0,1fr)] upto-900:gap-[clamp(32px,6vw,48px)]">
          {/* delay-* utilities rather than data-aos-delay: AOS's delay rules
              live in the stylesheet we deliberately do not import. */}
          <div data-aos="knocka-rise">
            <Image
              src="/branding/knocka-logo.svg"
              alt={siteConfig.name}
              width={272}
              height={82}
              className="h-[34px] w-auto"
            />
            {/* Reuses the site description rather than repeating the
                hero lead word for word. */}
            <p className="mt-[22px] max-w-[34ch] text-[15px]/[1.6] text-text-secondary">
              {siteConfig.description}
            </p>

            {/* Field and button share one pill — see EmailSignup's `inline`
                variant. Posts to /api/waitlist like the invite banner. */}
            <div className="mt-[clamp(24px,2.6vw,32px)] max-w-[360px]">
              <span className="mb-3 block text-[10px] font-[500] tracking-[0.24em] text-[rgba(255,255,255,0.34)] uppercase">
                Join the waitlist
              </span>
              <EmailSignup
                variant="inline"
                label="Your email address"
                buttonLabel="Send"
              />
            </div>

            {/* The header's "Get the app" lands here, so it carries its own
                scroll-margin — the global rule in base.css only covers
                sections. */}
            <div
              id="get-knocka"
              className="mt-[clamp(28px,3vw,38px)] scroll-mt-[clamp(92px,12vh,124px)]"
            >
              <span className="mb-3.5 block text-[10px] font-[500] tracking-[0.24em] text-[rgba(255,255,255,0.34)] uppercase">
                Get Knocka
              </span>
              <StoreBadges />
            </div>
          </div>

          <div
            data-aos="knocka-rise"
            className="grid grid-cols-4 gap-[clamp(18px,2.4vw,32px)] delay-[80ms] upto-560:grid-cols-2 upto-560:gap-x-5 upto-560:gap-y-7"
          >
            {LINK_COLUMNS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="mb-[18px] font-display text-[13px] font-medium tracking-[0.02em] text-text-primary">
                  {group.title}
                </h2>
                <ul className="m-0 grid list-none gap-[11px] p-0">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a href={link.href} className={LINK}>
                        {/* Nudge on hover so the column feels responsive
                            without any motion code. */}
                        <span className="inline-block transition-[transform] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1">
                          {link.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Negative offset — see the wordmark below for why the last two
            reveals on the page need one. */}
        <div
          data-aos="knocka-rise"
          data-aos-offset="-160"
          className="mt-[clamp(36px,4.5vw,60px)] flex flex-wrap items-center justify-between gap-x-7 gap-y-4 border-t border-t-border-faint pt-[22px] text-[13px] text-[rgba(255,255,255,0.4)] delay-[140ms] upto-560:flex-col upto-560:items-start"
        >
          <p>© {new Date().getFullYear()} Knocka. All rights reserved.</p>
        </div>

        {/*
          The oversized wordmark is the floor of the site: it rises into the
          panel and is cropped by the panel's own rounded edge, and its fill
          dissolves downward so the DNA field reads through the bottom of the
          letterforms. Stays in CSS — see footer.css.
        */}
        <div className="site-footer-wordmark" aria-hidden="true">
          {/*
            data-aos-offset is NOT a taste knob here.

            AOS fires on an absolute document offset: elementTop + offset,
            compared against scrollY + innerHeight. For the LAST element on
            the page that sum can land beyond the furthest the page can
            actually scroll, and then the reveal never runs at all. Measured
            at 390x844 with the global 90px offset, this element's trigger sat
            27px inside the maximum scroll position — the site's signature
            element was one layout change away from never appearing. The
            negative offset pulls the trigger up to a ~280px margin.

            IntersectionObserver, which is what Framer's whileInView uses,
            cannot fail this way. This is the cost of the AOS model, and it is
            why nothing above the footer should adopt it without checking the
            same arithmetic.
          */}
          <span data-aos="knocka-wordmark" data-aos-offset="-160">
            {WORDMARK}
          </span>
        </div>
      </div>
    </footer>
  );
}
