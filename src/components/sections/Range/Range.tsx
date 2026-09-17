"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { PointerEvent, ReactNode } from "react";

import { KnockMarks } from "./KnockMarks";
import { CAST, STEPS } from "./cast";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Where the pointer is over a profile, 0 to 1 on each axis, written as
 * --px / --py. range.css derives the tilt, the parallax and the light from
 * these two numbers, so hover never re-renders React.
 *
 * Mouse only: on touch there is no pointer to follow, and the tap still gets
 * the CSS :hover state (lift, knock rings, light) without a tilt.
 */
function trackPointer(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse") return;
  const profile = event.currentTarget;
  const box = profile.getBoundingClientRect();
  profile.style.setProperty(
    "--px",
    clamp01((event.clientX - box.left) / box.width).toFixed(3),
  );
  profile.style.setProperty(
    "--py",
    clamp01((event.clientY - box.top) / box.height).toFixed(3),
  );
}

/** Back to centre, so the tilt eases out rather than freezing mid-lean. */
function releasePointer(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty("--px");
  event.currentTarget.style.removeProperty("--py");
}

/**
 * The site's masked line reveal, triggered on view rather than on mount.
 *
 * `TextReveal` animates from `animate`, which for a section this far down the
 * page means the reveal is over long before anyone scrolls to it. Same mask,
 * same easing, same CSS (`.text-reveal` in utilities.css) — different
 * trigger.
 *
 * **The trigger must sit on the wrapper, not on the line.**
 * IntersectionObserver clips the intersection rect against an ancestor's
 * `overflow: hidden`, and the mask *is* an `overflow: hidden` ancestor
 * holding the line 110% below it — so the line reports a ratio of 0.05 and
 * `whileInView` never fires however far down the page you scroll. Measured.
 * The unclipped wrapper does the observing and the line follows as a variant.
 */
function RevealLine({
  children,
  delay,
  reduceMotion,
}: {
  children: ReactNode;
  delay: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.span
      className="text-reveal knock-title-line"
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.5 }}
    >
      <motion.span
        className="text-reveal-inner"
        variants={{
          hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: "110%" },
          shown: { opacity: 1, y: 0 },
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

/**
 * S3 — YOUR FACE. YOUR VOICE. YOUR KNOCK.
 *
 * A room of six, a band of moving type running through it, and the two
 * knock marks landing underneath. The people are unequal on purpose: two
 * stand on portrait plates at the edges of the composition, heads breaking
 * out over the top; the other four are circles in the corners. Every one of
 * them gets a different coloured ground, which is what turns six cutouts
 * into six profiles.
 *
 * **Not pinned, and nothing here is scroll-linked.** This section is the
 * pacing relief between two pinned sequences (S2 above, Rooms below) and it
 * has to stay that way: no `sticky`, no scroll container, no `useScroll`.
 * Every entrance is one-shot — AOS for the eyebrow and lead, `whileInView`
 * for the masked title and the profiles — the band is a CSS marquee, and
 * hover is CSS driven by two pointer variables — so the only continuous work
 * on the page is still the DNA canvas.
 *
 * See `cast.ts` for the two compositions and the six colours.
 */
export function Range() {
  const reduceMotion = useReducedMotion() === true;

  return (
    <section className="range" id="range" aria-labelledby="range-title">
      <div className="range-inner">
        <div className="knock-stage">
          <div className="knock-head">
            <p className="knock-eyebrow" data-aos="knocka-rise">
              <span aria-hidden="true">✦</span> Avatar messaging
            </p>

            <h1 className="knock-title" id="range-title">
              <RevealLine delay={0.04} reduceMotion={reduceMotion}>
                Meet Knocka.
              </RevealLine>
              <RevealLine delay={0.13} reduceMotion={reduceMotion}>
                Don&apos;t just text.
              </RevealLine>
              <RevealLine delay={0.22} reduceMotion={reduceMotion}>
                <span className="text-gradient">Knock.</span>
              </RevealLine>
            </h1>
          </div>

          {/*
            The band. It carries the five steps of the story as one line that
            never stops, so they are read as a sequence rather than as a list
            — and it cuts the composition in half on a tilt, which is what
            stops the section reading as a poster.

            The track is exactly two identical runs wide and travels -50%, so
            the loop is seamless without measuring anything. The gap lives on
            each item, never on the flex container: a container gap is
            counted once and not twice, and the seam opens up.
          */}
          <div className="knock-band" aria-hidden="true">
            <div className="knock-band-track">
              {[0, 1].map((run) => (
                <span className="knock-band-run" key={run}>
                  {STEPS.map((step) => (
                    <span className="knock-band-item" key={step}>
                      {step}
                      <i>✦</i>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          <div className="knock-tail">
            <p className="knock-lead delay-[100ms]" data-aos="knocka-rise">
              Pick a face, say it out loud, and knock. They feel it on their
              phone — that is the whole difference.
            </p>

            <KnockMarks offset={0.5} />
          </div>

          {CAST.map((profile) => (
            <motion.div
              key={profile.id}
              className="knock-profile"
              data-kind={profile.kind}
              style={{
                ["--x" as string]: `${profile.wide.x}%`,
                ["--y" as string]: `${profile.wide.y}%`,
                ["--s" as string]: `${profile.wide.s}`,
                ["--rot" as string]: `${profile.wide.rot}deg`,
                ["--nx" as string]: `${profile.narrow.x}%`,
                ["--ny" as string]: `${profile.narrow.y}%`,
                ["--ns" as string]: `${profile.narrow.s}`,
                ["--nrot" as string]: `${profile.narrow.rot}deg`,
                ["--tint" as string]: profile.tint,
                ["--ring" as string]: profile.ring,
                ["--img-w" as string]: `${profile.imgWidth ?? 100}%`,
                ["--focus" as string]: `${profile.focus ?? 12}%`,
              }}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 34, scale: 0.9 }
              }
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: reduceMotion ? 0.3 : 0.95,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : profile.delay,
              }}
              onPointerMove={trackPointer}
              onPointerLeave={releasePointer}
            >
              {/* One body for the plate and its name tag, so the hover moves
                  them together — see range.css. */}
              <div className="knock-body">
                <span className="knock-plate">
                  <span className="knock-cutout">
                    <Image
                      className="knock-art"
                      src={profile.src}
                      alt={`${profile.name} — ${profile.mood.toLowerCase()}`}
                      width={profile.w}
                      height={profile.h}
                      sizes="(max-width: 760px) 40vw, 20vw"
                    />
                  </span>
                </span>

                <p className="knock-name">
                  <b>{profile.name}</b>
                  <span>{profile.mood}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
