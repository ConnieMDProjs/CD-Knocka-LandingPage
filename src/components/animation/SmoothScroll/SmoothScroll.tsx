"use client";

import { cancelFrame, frame, type FrameData } from "framer-motion";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

import { registerLenis } from "@/lib/smooth-scroll";

/**
 * Inertial wheel scrolling for the whole document.
 *
 * Lenis smooths the *window's* scroll position rather than translating a
 * wrapper, so everything that reads native scroll keeps working untouched:
 * the sticky stages in Arrival and Rooms, framer's `useScroll`, AOS and the
 * DNA canvas all just see a smoother `scrollY`.
 *
 * **Driven from framer's frame loop, not its own rAF.** Arrival and Rooms map
 * scroll progress to transforms on framer's loop; ticking Lenis on the same
 * loop means the scroll value and the transforms derived from it are written
 * in the same frame, so the pinned sequences cannot lag the scroll by one.
 *
 * Touch keeps native scrolling (Lenis' default): phones already have
 * momentum, and emulating it feels worse than the real thing.
 *
 * Skipped entirely under reduced motion — inertia is motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      // Lets the header's in-page links glide instead of jumping.
      anchors: true,
    });
    registerLenis(lenis);

    const tick = (data: FrameData) => lenis.raf(data.timestamp);
    frame.update(tick, true);

    return () => {
      cancelFrame(tick);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
