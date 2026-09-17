"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const WIDTH = 480;
const HEIGHT = 72;
const MID = HEIGHT / 2;
const STEPS = 132;

/**
 * A voice envelope — **drawn, not recorded.**
 *
 * There is no audio in this project and no voice asset of any kind, so this
 * must never be dressed up as a player: no transport controls, no duration,
 * no scrubber, and it does not move once it has drawn. It is a graphic that
 * says "voice", in the same way a thin rule says "divider".
 *
 * The shape is deterministic, so the server and the client agree: one slow
 * envelope that swells and tapers like a spoken sentence, carrying three
 * sine terms so it reads as speech rather than as a tone.
 */
const buildPath = (): string => {
  let d = "";
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const envelope = Math.sin(Math.PI * t) ** 1.5;
    const carrier =
      Math.sin(t * Math.PI * 2 * 9) * 0.64 +
      Math.sin(t * Math.PI * 2 * 23 + 1.7) * 0.24 +
      Math.sin(t * Math.PI * 2 * 4 + 0.4) * 0.12;
    const x = t * WIDTH;
    const y = MID + carrier * envelope * (MID - 5);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    if (i !== STEPS) d += " ";
  }
  return d;
};

const WAVE_PATH = buildPath();

export function VoiceWave() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className="range-wave"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="range-wave-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent-purple)" />
          <stop offset="55%" stopColor="var(--color-accent-violet)" />
          <stop offset="100%" stopColor="var(--color-accent-cyan)" />
        </linearGradient>
      </defs>
      <motion.path
        d={WAVE_PATH}
        stroke="url(#range-wave-stroke)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        // Holds the hairline weight however wide the SVG is scaled.
        vectorEffect="non-scaling-stroke"
        initial={
          reduceMotion
            ? { opacity: 0, pathLength: 1 }
            : { opacity: 0, pathLength: 0 }
        }
        whileInView={{ opacity: 1, pathLength: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          duration: reduceMotion ? 0.3 : 1.5,
          ease: EASE_OUT,
          opacity: { duration: reduceMotion ? 0.3 : 0.5 },
        }}
      />
    </svg>
  );
}
