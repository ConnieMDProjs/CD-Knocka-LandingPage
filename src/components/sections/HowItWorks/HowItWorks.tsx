"use client";

import { motion, useReducedMotion } from "framer-motion";

import { StepArt } from "./StepArt";
import { ARROWS, NARROW_HOPS, STEPS, WIDE_HOPS, sideOf } from "./steps";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * HOW IT WORKS.
 *
 * Five cards down a zigzag, joined by one dashed line with an arrow on every
 * hop. Each card is a different colour and sits at its own angle, and
 * **hovering one takes it back to level** — the card straightens under the
 * pointer, which is the whole interaction and the reason the tilt is worth
 * having in the first place.
 *
 * The tilt is the CSS `rotate` property, not a transform. Framer owns the
 * card's `transform` for the entrance, and an inline transform beats any
 * `:hover` rule on the same element — `rotate` is a separate property, so the
 * two compose and hover still works after the entrance has run.
 *
 * The connector is generated from the same array that lays out the cards
 * (see `snake` in steps.ts), so the line cannot end up pointing at a card
 * that is not there. Nothing is measured and there is no scroll-linked value.
 */
export function HowItWorks() {
  const reduceMotion = useReducedMotion() === true;

  return (
    <section className="how" id="how" aria-labelledby="how-title">
      <div className="how-inner">
        <div className="how-head">
          {/* The head is AOS (delay-* utilities stagger it, see aos.css);
              the route and the cards below stay Framer, which owns their
              transforms for the path draw and the zigzag entrance. */}
          <p className="how-eyebrow" data-aos="knocka-rise">
            <span aria-hidden="true">✦</span> How it works
          </p>

          <h2
            className="how-title delay-[80ms]"
            id="how-title"
            data-aos="knocka-heading"
          >
            From a selfie to a knock,{" "}
            <span className="text-gradient">in five steps.</span>
          </h2>

          <p className="how-lead delay-[180ms]" data-aos="knocka-rise">
            No rig, no studio, no learning curve. One photo and you are in.
          </p>
        </div>

        <div className="how-track">
          {/* The dashed route between the cards. Decorative: the order is
              already carried by the numbered headings. */}
          <svg
            className="how-line"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {(
              [
                ["wide", WIDE_HOPS],
                ["narrow", NARROW_HOPS],
              ] as const
            ).map(([composition, paths]) =>
              paths.map((d, i) => (
                <motion.path
                  key={`${composition}-${i}`}
                  className={`how-line-${composition}`}
                  d={d}
                  stroke="url(#how-line-stroke)"
                  strokeWidth={2}
                  strokeDasharray="7 9"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.75 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: reduceMotion ? 0.3 : 1,
                    ease: "easeInOut",
                    delay: reduceMotion ? 0 : i * 0.12,
                  }}
                />
              )),
            )}

            <defs>
              <linearGradient id="how-line-stroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-cyan)" />
                <stop offset="50%" stopColor="var(--color-accent-purple)" />
                <stop offset="100%" stopColor="var(--color-accent-magenta)" />
              </linearGradient>
            </defs>
          </svg>

          {/* One arrow per hop, sitting on the middle of the curve. */}
          {ARROWS.map((arrow) => (
            <motion.span
              key={arrow.key}
              className="how-arrow"
              aria-hidden="true"
              style={{
                ["--ay" as string]: `${arrow.y}%`,
                ["--arot" as string]: `${arrow.rot}deg`,
              }}
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6 }
              }
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M8 2v11M3.4 8.6 8 13.2l4.6-4.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          ))}

          {STEPS.map((step, index) => (
            <motion.article
              key={step.id}
              className="how-card"
              data-side={sideOf(index)}
              style={{
                ["--rot" as string]: `${step.rot}deg`,
                ["--tint" as string]: step.tint,
                ["--ring" as string]: step.ring,
              }}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : {
                      opacity: 0,
                      y: 40,
                      x: sideOf(index) === "left" ? -22 : 22,
                    }
              }
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: reduceMotion ? 0.3 : 0.85,
                ease: EASE_OUT,
              }}
            >
              <span className="how-n" aria-hidden="true">
                {step.n}
              </span>

              <StepArt art={step.art} />

              <h3 className="how-card-title">{step.title}</h3>
              <p className="how-card-line">{step.line}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
