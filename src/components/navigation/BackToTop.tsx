"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

import { scrollToTarget } from "@/lib/smooth-scroll";

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The floating back-to-top control, bottom right.
 *
 * It exists only once the hero has scrolled fully out of view — above the
 * fold there is nowhere to go back to — and leaves again on the way up. Its
 * border is the page's scroll progress, so it also tells you how far down
 * you are.
 *
 * Everything on hover is CSS; see styles/back-to-top.css.
 */
export function BackToTop() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const { scrollYProgress } = useScroll();

  /*
    Routed through an identity transform on purpose, like Arrival and Rooms:
    Framer Motion v13 can hand a scroll value straight to a native
    ViewTimeline and stop writing the JS value, and that timeline was
    measured running out of step. The indirection keeps it on framer's loop.
  */
  const progress = useTransform(scrollYProgress, (value) => value);

  useEffect(() => {
    const hero = document.getElementById("range");
    if (!hero) return;
    // Visible only when the hero is out of view *above* the viewport, so it
    // never shows on first paint however short the window is.
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const toTop = () => {
    scrollToTarget(0);
    // The button leaves once the hero is back in view and would take focus
    // with it, so hand focus to the first control on the page instead.
    document
      .querySelector<HTMLElement>(".site-header a")
      ?.focus({ preventScroll: true });
  };

  const hidden = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 16, scale: 0.85 };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="back-to-top"
          className="btt"
          initial={hidden}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={hidden}
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : { type: "spring", stiffness: 300, damping: 26, mass: 0.8 }
          }
        >
          <button
            type="button"
            className="btt-button"
            aria-label="Back to top"
            onClick={toTop}
          >
            <svg className="btt-ring" viewBox="0 0 48 48" aria-hidden="true">
              <defs>
                <linearGradient id="btt-ring-stroke" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-violet)" />
                  <stop offset="100%" stopColor="var(--color-accent-magenta)" />
                </linearGradient>
              </defs>
              <circle className="btt-ring-track" cx="24" cy="24" r="23" />
              <motion.circle
                className="btt-ring-fill"
                cx="24"
                cy="24"
                r="23"
                style={{ pathLength: progress }}
              />
            </svg>

            <span className="btt-arrow" aria-hidden="true">
              <ArrowUp />
              <ArrowUp />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
