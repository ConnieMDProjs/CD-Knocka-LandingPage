"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { KNOCK_BEATS } from "@/components/sections/Arrival/score";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * The knock, restated calmly.
 *
 * `KNOCK_BEATS` is imported from S2 rather than redeclared, because the gap
 * between the two hits is the brand and two copies of it would drift apart.
 * S2 owns the constant; this is a read-only reuse. (When a phase is allowed
 * to touch both sections, it belongs in `src/lib/`.)
 *
 * S2 arms its knock from scroll progress because it is a pinned sequence.
 * This section is not pinned, so the trigger is simply "in view" — but the
 * rhythm is still a clock, not the scroll wheel, which is the part that
 * matters. Exactly two marks, always 0.34s apart, no loop.
 */
export interface KnockMarksProps {
  /**
   * Seconds to wait before the first mark, on top of its beat. The marks
   * land when the knock arrives, not when it was sent, so the caller passes
   * the send time plus the travel time.
   */
  readonly offset?: number;
}

export function KnockMarks({ offset = 0 }: KnockMarksProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { amount: 0.9 });
  const shown = isInView || reduceMotion === true;

  return (
    <p className="range-knocks" ref={ref}>
      {KNOCK_BEATS.map((beat, index) => (
        <motion.span
          key={beat}
          className="range-knock"
          data-mark={index + 1}
          initial={false}
          animate={
            shown
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.72, y: 10 }
          }
          transition={
            shown && !reduceMotion
              ? { duration: 0.34, ease: EASE_OUT, delay: offset + beat }
              : { duration: 0.2 }
          }
        >
          Knock
        </motion.span>
      ))}
    </p>
  );
}
