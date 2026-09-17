"use client";

import AOS from "aos";
import { useEffect } from "react";

/**
 * Initialises AOS exactly once, for the whole document.
 *
 * Mounted from layout.tsx rather than from a section, which is what makes
 * "exactly once" structural rather than a convention someone has to remember:
 * there is one layout, and AOS.init is idempotent-by-position.
 *
 * **No `aos/dist/aos.css`.** AOS's JavaScript only toggles two classes,
 * `aos-init` and `aos-animate`; every animation it ships is plain CSS keyed
 * off those. This page needs four reveals — rise, heading, zoom and the footer
 * wordmark — all defined in styles/aos.css, so importing the library's 26KB
 * stylesheet to use a few percent of it would be dead weight. The stagger uses Tailwind's own `delay-*` utilities instead of
 * AOS's `data-aos-delay`, for the same reason.
 *
 * Reduced motion is handled by AOS's own `disable` hook, which strips the
 * `data-aos` attributes and never adds `aos-init` — so the elements are simply
 * visible, with no transition to suppress. Checked at init only, which matches
 * how the rest of the page reads the preference.
 */
export function Aos() {
  useEffect(() => {
    AOS.init({
      once: true,
      // Distance above the viewport bottom at which a reveal fires. Chosen to
      // land close to Framer's `viewport.amount` triggers on the blocks this
      // replaced, so the page's rhythm does not change.
      offset: 90,
      duration: 800,
      disable: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  return null;
}
