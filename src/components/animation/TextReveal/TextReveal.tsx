"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface TextRevealProps {
  children: ReactNode;
  /** Seconds to wait, once in view, before the line rises. */
  delay?: number;
  className?: string;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Masked line reveal: the line rises out of its own overflow box instead of
 * fading in. Transform + opacity only, so it stays on the compositor.
 *
 * The wrapper's padding/margin pair keeps descenders and gradient bleed from
 * being clipped by the mask.
 *
 * **Triggered on view, not on mount.** Mount-triggered, a heading further
 * down the page finished its reveal long before anyone scrolled to it. At the
 * top of the page the two are the same thing.
 *
 * **The trigger sits on the wrapper, not on the line.** IntersectionObserver
 * clips against an ancestor's `overflow: hidden`, and the mask *is* that
 * ancestor, holding the line 110% below it — so the line itself never
 * reports as visible. The unclipped wrapper observes and the line follows as
 * a variant. Same fix as `RevealLine` in Range.tsx.
 */
export function TextReveal({ children, delay = 0, className }: TextRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn("text-reveal", className)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.span
        className="text-reveal-inner"
        variants={{
          hidden: reduceMotion ? { opacity: 0 } : { y: "110%", opacity: 0 },
          shown: { y: 0, opacity: 1 },
        }}
        transition={{
          duration: reduceMotion ? 0.3 : 1.05,
          ease: EASE_OUT,
          delay: reduceMotion ? 0 : delay,
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}
