"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { activeNavLinks, siteConfig } from "@/lib/site-config";
import { scrollToTarget } from "@/lib/smooth-scroll";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Class strings live at module scope rather than inline, the way Button.tsx
 * keeps its variants: the bar carries thirty-odd utilities and inlining them
 * would bury the markup.
 *
 * Two conversion rules are load-bearing here:
 *
 * 1. **One variant type per property.** The stylesheet let the dense state
 *    (specificity 0,2,0) beat the 760px media query (0,1,0) on padding.
 *    Utilities are all one class, so that ordering guarantee is gone. The
 *    media query only ever changed the *horizontal* padding — its vertical
 *    values were identical to the base — so the narrow variant sets pr/pl
 *    only and `dense` is the sole owner of pt/pb. The conflict is removed by
 *    construction rather than by hoping Tailwind emits them in a useful order.
 *
 * 2. **font-[500], not font-medium.** --font-weight-medium is 600 in this
 *    project's tokens; the nav was authored at 500.
 */
const BAR_BASE =
  "relative mx-auto grid w-[min(var(--stage-max),100%)] grid-cols-[1fr_auto_1fr] " +
  "items-center gap-6 pt-2.5 pr-3 pb-2.5 pl-5 " +
  "rounded-panel border border-border-subtle bg-[var(--surface-header)] " +
  "backdrop-blur-[18px] backdrop-saturate-[1.4] " +
  "shadow-[var(--shadow-header),var(--hairline-top)] " +
  "transition-[background-color,border-color,box-shadow,padding] duration-[350ms] ease-[ease] " +
  "upto-1024:grid-cols-[1fr_auto_auto] upto-760:gap-3 upto-760:pr-2.5 upto-760:pl-4";

/** Once scrolled, the bar reads as a denser control surface. */
const BAR_DENSE =
  "data-[dense=true]:border-border-glass data-[dense=true]:bg-[var(--surface-header-dense)] " +
  "data-[dense=true]:pt-[7px] data-[dense=true]:pb-[7px] " +
  "data-[dense=true]:shadow-[var(--shadow-header),var(--shadow-header-glow),var(--hairline-top)]";

const NAV_LINK =
  "relative rounded-xl px-3.5 py-[9px] text-nav font-[500] text-text-secondary " +
  "no-underline transition-[color] duration-[250ms] ease-[ease] interact:text-text-primary";

const MOBILE_PANEL =
  "mx-auto mt-2.5 mb-0 w-[min(var(--stage-max),100%)] origin-top p-3.5 " +
  "rounded-panel border border-border-subtle bg-[var(--surface-header-dense)] " +
  "backdrop-blur-[18px] backdrop-saturate-[1.4] " +
  "shadow-[var(--shadow-header),var(--hairline-top)]";

const MOBILE_LINK =
  "rounded-xl px-3 py-[13px] text-[15px] font-[500] text-text-secondary no-underline " +
  "transition-[background-color,color] duration-200 ease-[ease] " +
  "interact:bg-glass-strong interact:text-text-primary";

export function SiteHeader() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isDense, setIsDense] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    setIsDense(value > 24);
  });

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  /**
   * The CTAs are buttons, not links — a `<button>` inside an `<a>` is invalid
   * markup — so they scroll themselves, through Lenis when it is running
   * (see lib/smooth-scroll). Both paths honour the `scroll-margin-top` in
   * base.css, which is what keeps the target's heading clear of this bar. The
   * nav links above stay real anchors: they are navigation and should behave
   * like it with JS off.
   */
  const jumpTo = useCallback(
    (hash: string) => {
      closeMenu();
      scrollToTarget(hash);
    },
    [closeMenu],
  );

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, closeMenu]);

  return (
    // `site-header` carries no styles any more — it is the hook the noscript
    // reveal in layout.tsx targets. See NOSCRIPT_REVEAL there before renaming.
    <motion.header
      className="site-header fixed top-4 right-0 left-0 z-[60] px-[var(--container-gutter)]"
      initial={reduceMotion ? false : { opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.05 }}
    >
      <div
        className={`${BAR_BASE} ${BAR_DENSE}`}
        data-dense={isDense}
        data-open={isMenuOpen}
      >
        <a
          href="#"
          className="flex flex-none items-center rounded-lg leading-[0]"
          aria-label={`${siteConfig.name} home`}
        >
          <Image
            src="/branding/knocka-logo.svg"
            alt={siteConfig.name}
            width={272}
            height={82}
            priority
            className="h-8 w-auto upto-760:h-[26px]"
          />
        </a>

        <nav
          className="flex items-center justify-center gap-1 upto-1024:hidden"
          aria-label="Primary"
        >
          {activeNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={NAV_LINK}
              onMouseEnter={() => setHovered(link.href)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(link.href)}
              onBlur={() => setHovered(null)}
            >
              {/* One shared pill that slides between links (layoutId), so the
                  nav feels like a single instrument. */}
              {hovered === link.href && (
                <motion.span
                  className="absolute inset-0 rounded-xl bg-glass-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_24px_-10px_var(--color-accent-purple)]"
                  layoutId="site-nav-pill"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                          mass: 0.7,
                        }
                  }
                />
              )}
              <span className="relative">{link.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2.5 upto-360:hidden">
          {/* Was "Glass Matrix", which named nothing on the page and went
              nowhere. Drops out at 760px so the bar can keep the primary CTA.
              This has to be a variant on the element: a stylesheet rule
              cannot outrank the primitive's own display utility. */}
          <Button
            variant="ghost"
            className="upto-760:hidden"
            onClick={() => jumpTo("#get-knocka")}
          >
            Get the app
          </Button>
          {/* Tightens once the ghost CTA drops out at 760px, so the bar keeps
              its proportions instead of the last control looking oversized. */}
          <Button
            variant="primary"
            className="upto-760:px-4 upto-760:py-[9px]"
            arrow
            onClick={() => jumpTo("#newsletter")}
          >
            Join Waitlist
          </Button>
        </div>

        <button
          type="button"
          className="hidden h-[42px] w-[42px] flex-none place-items-center rounded-[14px] border border-border-glass bg-glass-strong upto-1024:grid"
          aria-expanded={isMenuOpen}
          aria-controls="site-mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* Stays in CSS: two bars folding into a cross is one element plus
              its ::before, each transitioning transform and width across two
              states. As utilities that is a `before:` chain nobody can read. */}
          <span className="site-menu-icon" data-open={isMenuOpen} />
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="site-mobile-menu"
            className={MOBILE_PANEL}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.32, ease: EASE_OUT }}
          >
            <nav className="grid" aria-label="Mobile">
              {activeNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={MOBILE_LINK}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-2.5 grid gap-2 border-t border-t-border-faint pt-3.5 min-[761px]:hidden">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => jumpTo("#get-knocka")}
              >
                Get the app
              </Button>
              <Button
                variant="primary"
                className="w-full"
                arrow
                onClick={() => jumpTo("#newsletter")}
              >
                Join Waitlist
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
