"use client";

import {
  motion,
  useMotionValueEvent,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";

import { TextReveal } from "@/components/animation/TextReveal";
import { rooms } from "@/lib/site-config";

import { RoomProgress } from "./RoomProgress";
import { RoomScene } from "./RoomScene";

/**
 * How far the strip has to travel, as a fraction of its own width.
 *
 * The strip holds three panels, so its width is 3 x panel. Moving from panel
 * one centred to panel three centred is a shift of exactly two panels, which
 * is 2/3 of the strip. Because it is expressed as a percentage of the element
 * itself, this number never has to be measured and never changes with the
 * breakpoint — the panel width can be whatever the layout wants.
 */
const STRIP_TRAVEL = "-66.6667%";

/**
 * A beat of stillness at each end, so the first and last rooms are not
 * already sliding the instant they arrive. The strip is parked for the first
 * 6% and the last 12% of the runway; the last one is longer because room
 * three has nothing after it and should be looked at before the section ends.
 */
const HOLD_IN = 0.06;
const HOLD_OUT = 0.88;

export function Rooms() {
  const reduceMotion = useReducedMotion();
  const isStatic = reduceMotion === true;
  const runwayRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Bitmask of rooms that should be decoding. A number rather than an array
  // so the equality guard below is a plain comparison.
  const [playMask, setPlayMask] = useState(1);

  // Generous margin so the first room has downloaded before it is needed.
  const isNear = useInView(runwayRef, { margin: "80% 0px 80% 0px" });
  const isOnScreen = useInView(runwayRef, { amount: 0.01 });

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  /*
    Framer Motion v13 hands scroll-linked transform chains to the browser as
    native ViewTimeline animations, and stops writing the JS value once it
    does. Measured here, that native timeline runs out of step with the
    useScroll range — it reported 52.8% progress at the end of the runway.

    Acceleration is only attached when a transform maps an array range
    straight off the scroll value, so routing it through one function
    transform detaches the descriptor and keeps the whole chain on framer's
    own frameloop, where the values are correct. Keep this indirection.
  */
  const progress = useTransform(scrollYProgress, (value) => value);

  /** Vertical scroll pulls the world sideways. translateX only. */
  const x = useTransform(
    progress,
    [0, HOLD_IN, HOLD_OUT, 1],
    ["0%", "0%", STRIP_TRAVEL, STRIP_TRAVEL],
  );

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const last = rooms.length - 1;
    // Where the strip is, measured in panels: 0 at room one, 2 at room three.
    const span = (Math.min(HOLD_OUT, Math.max(HOLD_IN, value)) - HOLD_IN) /
      (HOLD_OUT - HOLD_IN);
    const position = span * last;
    const nearest = Math.min(last, Math.max(0, Math.round(position)));

    /*
      EXACTLY ONE ROOM DECODES. Measured on this page, parked in a settled
      two-decoder window with GPU decoding on: one playing video holds the DNA
      canvas at 60fps, two drops it to 30, and nothing else in this section
      costs anything — hiding the videos restored 60fps while removing the
      fades, the glow and will-change each changed nothing.

      So the outgoing room freezes on its last frame as the strip moves on.
      It is half off the viewport and behind the side scrim by then, which is
      the same trade the depth-stack version made for the same reason.
    */
    const mask = 1 << nearest;

    // Functional updates with an equality guard: this fires on every scroll
    // frame but only ever re-renders on an actual change.
    setActive((prev) => (prev === nearest ? prev : nearest));
    setPlayMask((prev) => (prev === mask ? prev : mask));
  });

  return (
    <section className="rooms" id="rooms" aria-labelledby="rooms-title">
      {/*
        The introduction sits outside the pinned runway, so it is read at full
        size and in full before anything moves, then scrolls away as the strip
        takes over. Nothing is ever laid over it.
      */}
      <div className="rooms-intro">
        <p className="rooms-eyebrow" data-aos="knocka-rise">
          <span aria-hidden="true">✦</span> Rooms
        </p>

        <h2 className="rooms-title" id="rooms-title">
          <TextReveal className="rooms-title-line" delay={0.05}>
            Don&apos;t just chat.
          </TextReveal>
          <TextReveal className="rooms-title-line" delay={0.16}>
            <span className="text-gradient">Go somewhere.</span>
          </TextReveal>
        </h2>

        <p className="rooms-lead delay-[300ms]" data-aos="knocka-rise">
          Step in as your avatar — the room sets the mood, you bring the
          presence.
        </p>
      </div>

      <div className="rooms-runway" ref={runwayRef}>
        <div className="rooms-stage">
          <div className="rooms-viewport">
            {/* Glow layers, one per room, crossfaded by class rather than by
                a per-frame style write. They sit behind the strip and tint
                the DNA field around it. */}
            <div className="rooms-glow" aria-hidden="true">
              {rooms.map((room, index) => (
                <span
                  key={room.id}
                  className="rooms-glow-layer"
                  data-on={index === active}
                  style={{ ["--glow" as string]: room.glow }}
                />
              ))}
            </div>

            <motion.div
              className="rooms-strip"
              style={isStatic ? undefined : { x }}
            >
              {rooms.map((room, index) => (
                <article className="rooms-panel" key={room.id}>
                  <div className="rooms-panel-frame">
                    <RoomScene
                      room={room}
                      isArmed={isNear}
                      isEager={index === 0 || (isOnScreen && index <= active + 1)}
                      isPlaying={
                        !isStatic &&
                        isOnScreen &&
                        (playMask & (1 << index)) !== 0
                      }
                    />
                  </div>

                  {/* The label belongs to its room and travels with it. */}
                  <p className="rooms-panel-label">
                    <span className="rooms-panel-ordinal">{room.ordinal}</span>
                    <span className="rooms-panel-name">{room.name}</span>
                    <span className="rooms-panel-line">{room.line}</span>
                  </p>
                </article>
              ))}
            </motion.div>

            {/* The strip travels through darkness: it dissolves at both ends
                rather than stopping at a hard edge. */}
            <div className="rooms-fade rooms-fade-top" aria-hidden="true" />
            <div className="rooms-fade rooms-fade-bottom" aria-hidden="true" />
            <div className="rooms-fade rooms-fade-left" aria-hidden="true" />
            <div className="rooms-fade rooms-fade-right" aria-hidden="true" />
          </div>

          <div className="rooms-index">
            <RoomProgress rooms={rooms} active={active} progress={progress} />
          </div>
        </div>
      </div>

      {/*
        The landing statement. The runway used to end on silence, which left
        the three worlds as scenery rather than as an argument. It sits after
        the pinned stage on normal scroll, deliberately small and quiet — the
        section has just had its peak and the next one needs the room.
      */}
    </section>
  );
}
