"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * The hero's focal object: the Knocka avatar knocking through a message
 * frame, sitting on the DNA strand so the particles read as the energy the
 * knock releases.
 *
 * Layers, back to front: bloom and halo (which tint the DNA behind the
 * frame) -> artwork.
 */
export function KnockPortal() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="knock-portal">
      <div className="knock-portal-bloom" aria-hidden="true" />
      <div className="knock-portal-halo" aria-hidden="true" />

      <motion.div
        className="knock-portal-art"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.3 : 1.2, ease: EASE_OUT, delay: 0.2 }}
      >
        <motion.div
          className="knock-portal-float"
          animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
        >
          <Image
            src="/branding/knocka-avatar-logo.png"
            alt="A Knocka avatar knocking through a message frame"
            // Intrinsic size of the asset. Display size comes from CSS.
            width={615}
            height={512}
            priority
            sizes="(max-width: 900px) 88vw, 42vw"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
