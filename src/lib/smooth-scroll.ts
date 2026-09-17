import type Lenis from "lenis";

/**
 * The page's one Lenis instance, registered by `SmoothScroll`. Module state
 * rather than context: the callers (header CTAs, back-to-top) only need it
 * inside click handlers, long after mount, and never re-render on it.
 */
let lenis: Lenis | null = null;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Scroll to a selector, an element or a pixel offset.
 *
 * Goes through Lenis when it is running, so a programmatic jump uses the same
 * easing as the wheel instead of the browser's native smooth scroll fighting
 * Lenis frame by frame. Lenis reads `scroll-margin-top`, so the offsets in
 * base.css that keep headings clear of the header still apply.
 *
 * Without Lenis (reduced motion, or before mount) it falls back to the native
 * behaviour, read at click time so a mid-session OS change is honoured.
 */
export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) {
    lenis.scrollTo(target);
    return;
  }

  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches
    ? "auto"
    : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior });
    return;
  }

  const element =
    typeof target === "string" ? document.querySelector(target) : target;
  element?.scrollIntoView({ behavior, block: "start" });
}
