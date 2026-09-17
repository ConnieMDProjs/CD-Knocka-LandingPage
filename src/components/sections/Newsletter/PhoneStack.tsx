"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** A place in the fan. x/y are percentages of the phone's own size. */
interface Pose {
  readonly x: number;
  readonly y: number;
  readonly rotate: number;
}

interface Phone {
  readonly src: string;
  readonly alt: string;
  /** Where it sits at rest. */
  readonly rest: Pose;
  /** Where it drifts to while the panel is hovered. */
  readonly open: Pose;
}

/**
 * Real screens from the app, in the order someone meets them: set up an
 * avatar, land on the welcome, open the app. Nothing here is a mockup or a
 * rendered device frame — the artwork already carries the phone, complete
 * with transparent corners, so the CSS only has to match its radius.
 *
 * Poses are percentages rather than pixels so the whole fan scales with
 * --phone-w. One set of numbers works from 320px to 1920px.
 *
 * The three angles are deliberately not equal. Giving each screen its own
 * tilt is what separates the silhouettes where they overlap — with a shared
 * angle and an even step they read as one folded sheet rather than three
 * objects.
 */
const PHONES: readonly Phone[] = [
  {
    src: "/news-latter-phone-img/avatar-setup.png",
    alt: "Building a Knocka avatar",
    rest: { x: -8, y: 13, rotate: -18 },
    open: { x: -30, y: 22, rotate: -24 },
  },
  {
    src: "/news-latter-phone-img/Welcome.png",
    alt: "The Knocka welcome screen: don't text, arrive",
    rest: { x: 0, y: -5, rotate: -12 },
    open: { x: 0, y: -14, rotate: -8 },
  },
  {
    // The file name has a space in it. Encoded, because next/image hands the
    // src to the optimiser as a query parameter and a raw space does not
    // survive the round trip.
    src: "/news-latter-phone-img/splash%20screen.png",
    alt: "The Knocka splash screen",
    rest: { x: 8, y: -22, rotate: -19 },
    open: { x: 30, y: -32, rotate: -25 },
  },
];

const pose = (p: Pose, dropBy = 0) => ({
  x: `${p.x}%`,
  y: `${p.y + dropBy}%`,
  rotate: p.rotate,
});

/**
 * Three app screens fanned out and cropped by the panel edge.
 *
 * **The hover target is the whole invite panel, not the fan.** Hovering the
 * screens themselves meant the effect only existed if you happened to move
 * the pointer to the right-hand third of the section; now reading the copy or
 * reaching for the CTA drifts them apart. The listener goes on the panel
 * because that element is rendered by a server component — attaching here
 * keeps `Newsletter.tsx` free of `"use client"`.
 *
 * `pointerenter` / `pointerleave` rather than `mouseover`: they do not bubble,
 * so moving between children inside the panel never re-fires them.
 *
 * The entrance and the hover share one `animate` prop instead of stacking
 * `whileInView` over `whileHover`. Framer ranks `whileInView` above `animate`,
 * so the two would have fought for the same element.
 */
export function PhoneStack() {
  const reduceMotion = useReducedMotion() === true;
  const stackRef = useRef<HTMLDivElement>(null);
  const [lifted, setLifted] = useState(false);

  // The panel clips with overflow:hidden and the fan deliberately overflows
  // it, so IntersectionObserver only ever sees part of this wrapper. 0.2
  // keeps the trigger well clear of that ceiling.
  const revealed = useInView(stackRef, { once: true, amount: 0.2 });

  useEffect(() => {
    if (reduceMotion) return;
    const panel = stackRef.current?.closest(".newsletter-panel");
    if (!panel) return;

    const enter = () => setLifted(true);
    const leave = () => setLifted(false);
    panel.addEventListener("pointerenter", enter);
    panel.addEventListener("pointerleave", leave);
    return () => {
      panel.removeEventListener("pointerenter", enter);
      panel.removeEventListener("pointerleave", leave);
    };
  }, [reduceMotion]);

  // Reduced motion skips the entrance outright rather than fading in on view.
  // The copy beside these is AOS, whose "disable" hook leaves it
  // unconditionally visible, so a scroll-gated reveal here left the three
  // screens at opacity 0 while the words around them were painted.
  const state = reduceMotion
    ? "rest"
    : !revealed
      ? "stacked"
      : lifted
        ? "open"
        : "rest";

  return (
    <motion.div
      ref={stackRef}
      className="newsletter-phones"
      initial={reduceMotion ? "rest" : "stacked"}
      animate={state}
    >
      {PHONES.map((phone, index) => (
        <motion.div
          key={phone.src}
          className={`newsletter-phone newsletter-phone-${index + 1}`}
          variants={{
            stacked: {
              ...pose(phone.rest, reduceMotion ? 0 : 16),
              opacity: 0,
            },
            rest: {
              ...pose(phone.rest),
              opacity: 1,
              transition: {
                duration: reduceMotion ? 0.3 : 0.95,
                ease: EASE_OUT,
                delay: reduceMotion ? 0 : 0.06 + index * 0.09,
              },
            },
            open: {
              ...pose(phone.open),
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 190,
                damping: 26,
                mass: 0.8,
                // A hair of stagger so they drift apart rather than as a slab.
                delay: index * 0.035,
              },
            },
          }}
        >
          <Image
            src={phone.src}
            alt={phone.alt}
            // Intrinsic size of the artwork. Display size comes from CSS.
            width={375}
            height={812}
            sizes="(min-width: 901px) 190px, 120px"
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
