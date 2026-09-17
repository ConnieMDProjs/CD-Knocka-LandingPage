"use client";

import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { arrivalMedia } from "@/lib/site-config";

import { ArrivalMedia } from "./ArrivalMedia";
import { ConversationThread } from "./ConversationThread";
import { SCORE } from "./score";

/**
 * S2 — THE FLAT -> THE ARRIVAL.
 *
 * The page's comprehension moment: an ordinary thread builds, goes quiet,
 * sits there being boring for a long stretch of scrolling, collapses into a
 * point, the plate covering the DNA field lifts, and the avatar opens out of
 * that same point and knocks.
 *
 * The flat half owns about two thirds of the runway. That imbalance is the
 * design: the question the section asks only lands if the boredom was felt
 * first. See score.ts, which holds every beat.
 *
 * Three things carry the story, and they are one property each:
 *
 *   1. `.arrival-scrim` — a single solid plate over the fixed DNA canvas.
 *      Only its opacity animates. The site's own signature dying and coming
 *      back is the argument this section is making, so it is worth one layer.
 *   2. `.arrival-thread` — one `scale` on the wrapper pulls the whole
 *      conversation into its own centre.
 *   3. `.arrival-frame-outer` — the frame opens out of that same centre.
 *
 * No second canvas, no filter on anything that moves, no layout animation.
 */
export function Arrival() {
  const reduceMotion = useReducedMotion();
  const isStatic = reduceMotion === true;
  const runwayRef = useRef<HTMLDivElement>(null);

  const [hasArrived, setHasArrived] = useState(false);
  /**
    * Set by the media itself when the arrival actually begins, not by the
    * scroll threshold that requested it. The frame kick and the edge flash
    * are timed to the video's own first two knocks, so they have to start
    * counting from its first frame, not from the scroll position that asked
    * for it.
    */
  const [, setHasKnocked] = useState(false);

  // Generous margin so the video has downloaded before the arrival beat
  // needs it — it is 1.5MB and the knock has to land on time.
  const isNear = useInView(runwayRef, { margin: "60% 0px 60% 0px" });
  const isOnScreen = useInView(runwayRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  /*
    A second range covering the *approach*: 0 when the runway's top is still a
    viewport away, 1 the moment it pins. The plate is multiplied by it, so it
    dims in as you come down to the section instead of a hard black band
    rising over the end of the hero. The plate's geometry keeps it off the
    hero entirely (see arrival.css); this is what keeps its arrival soft.
  */
  const { scrollYProgress: approach } = useScroll({
    target: runwayRef,
    offset: ["start end", "start start"],
  });

  /*
    Routed through one identity function transform on purpose. Framer Motion
    v13 accelerates scroll-linked chains onto native ViewTimeline animations
    and then stops writing the JS value — and that native timeline runs out of
    step with the useScroll range (measured at 52.8% progress at the end of
    the Rooms runway). Acceleration only attaches when a transform maps an
    array range straight off the scroll value, so this indirection detaches it
    and keeps the whole section on framer's own frameloop. Keep it.
  */
  const progress = useTransform(scrollYProgress, (value) => value);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    // Hysteresis: the arm and disarm thresholds are far apart, so a scroll
    // resting on a boundary cannot retrigger every frame. Functional update
    // with an equality guard, so this listener runs on every scroll frame but
    // only re-renders on an actual state change.
    const arrived = value >= (hasArrived ? SCORE.arriveReset : SCORE.arriveAt);
    setHasArrived((prev) => (prev === arrived ? prev : arrived));
    // Scrolling back out of the arrival rewinds the media, so the impulse
    // has to disarm with it or the replay would start already-kicked.
    if (!arrived) setHasKnocked((prev) => (prev ? false : prev));
  });

  const handlePlaybackStart = useCallback(() => setHasKnocked(true), []);

  const scrimTrack = useTransform(progress, SCORE.scrim, [1, 0]);
  const scrim = useTransform(
    [approach, scrimTrack],
    ([fadeIn, track]: number[]) => fadeIn * track,
  );

  const flatOpacity = useTransform(progress, SCORE.flatLine, [0, 1, 1, 0]);
  const flatY = useTransform(progress, SCORE.flatLine, [18, 0, 0, -14]);

  const arriveOpacity = useTransform(progress, SCORE.arriveLine, [0, 1]);
  const arriveY = useTransform(progress, SCORE.arriveLine, [22, 0]);

  const subOpacity = useTransform(progress, SCORE.arriveSub, [0, 1]);
  const subY = useTransform(progress, SCORE.arriveSub, [14, 0]);

  const sparkOpacity = useTransform(progress, SCORE.spark, [0, 1, 0]);
  const sparkScale = useTransform(progress, SCORE.spark, [0.2, 1, 2.1]);

  const bloomOpacity = useTransform(progress, SCORE.bloom, [0, 0.95, 0.6]);
  const bloomScale = useTransform(progress, SCORE.bloom, [0.45, 1, 1.06]);

  const frameOpacity = useTransform(progress, SCORE.frame, [0, 1]);
  const frameScale = useTransform(progress, SCORE.frame, [0.3, 1]);
  const frameY = useTransform(progress, SCORE.frame, ["7%", "0%"]);

  const closerOpacity = useTransform(progress, SCORE.closer, [0, 1]);
  const closerY = useTransform(progress, SCORE.closer, [16, 0]);


  return (
    <section className="arrival" id="arrival" aria-labelledby="arrival-title">
      <div className="arrival-runway" ref={runwayRef}>
        <div className="arrival-stage">
          {/*
            The plate. It reaches well past the pinned stage so its feathered
            edges stay off-screen while the section is pinned, and so
            approaching the section reads as the lights going down rather than
            as a hard edge sliding up the page.
          */}
          {!isStatic && (
            <motion.div
              className="arrival-scrim"
              aria-hidden="true"
              style={{ opacity: scrim }}
            />
          )}

          <h2 className="arrival-title" id="arrival-title">
            <motion.span
              className="arrival-title-line"
              style={isStatic ? undefined : { opacity: flatOpacity, y: flatY }}
            >
              Text is flat and boring.
            </motion.span>
            <motion.span
              className="arrival-title-line"
              style={
                isStatic ? undefined : { opacity: arriveOpacity, y: arriveY }
              }
            >
              <span className="text-gradient">
                What if someone <br/> knocks on your phone?
              </span>
            </motion.span>
          </h2>

          {/* The answer to the question above, in one line. Its own row so
              the headline cell never has to resize to hold it. */}
          <motion.p
            className="arrival-sub"
            style={isStatic ? undefined : { opacity: subOpacity, y: subY }}
          >
            Send your avatar with your message.
          </motion.p>

          <div className="arrival-core">
            <ConversationThread progress={progress} isStatic={isStatic} />

            {/* The frame follows the media's real aspect ratio rather than
                a hard-coded one, so swapping the asset cannot letterbox it. */}
            <div
              className="arrival-stack"
              style={
                { "--arrival-ratio": arrivalMedia.ratio } as CSSProperties
              }
            >
              {/* Painted gradients, never a blurred layer: both of these
                  scale, and a filter on a scaling element re-rasterises
                  every frame. The gradient is the blur. */}
              <motion.span
                className="arrival-bloom"
                aria-hidden="true"
                style={
                  isStatic
                    ? undefined
                    : { opacity: bloomOpacity, scale: bloomScale }
                }
              />

              {!isStatic && (
                <motion.span
                  className="arrival-spark"
                  aria-hidden="true"
                  style={{ opacity: sparkOpacity, scale: sparkScale }}
                />
              )}

              <motion.div
                className="arrival-frame-outer"
                style={
                  isStatic
                    ? undefined
                    : { opacity: frameOpacity, scale: frameScale, y: frameY }
                }
              >
                {/*
                  The knock impulse lives on its own element: the outer
                  wrapper's scale is already owned by scroll, and one element
                  cannot take a transform from a motion value and from a
                  keyframe animation at the same time.
                */}
             
                  <ArrivalMedia
                    isArmed={isNear}
                    isPlaying={isOnScreen && hasArrived}
                    allowManualPlay={isStatic}
                    onPlaybackStart={handlePlaybackStart}
                  />

                  {/* Static geometry, opacity only: the edge light for each
                      hit, on the same impulse track as the frame kick. */}
                
              </motion.div>
            </div>
          </div>

          <motion.p
            className="arrival-closer"
            style={isStatic ? undefined : { opacity: closerOpacity, y: closerY }}
          >
            That&apos;s the difference.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
