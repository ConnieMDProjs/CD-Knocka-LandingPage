"use client";

import {
  motion,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "ghost";
export type ButtonSize = "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  /** A trailing arrow that slides out and back in on hover. */
  arrow?: boolean;
  /**
   * Lean toward the pointer. Turn it off for a button that sits inside
   * another control's outline — the footer's inline field — where drifting
   * would push it into the pill's edge.
   */
  magnetic?: boolean;
}

/**
 * Everything shared by every CTA on the page. `rounded-control`, `text-nav`,
 * `text-body` and `font-medium` all come from the @theme tokens, so these are
 * the design system's own values rather than Tailwind's defaults.
 *
 * No `border-none` here: Tailwind's preflight already gives every element
 * `border-width: 0`, and adding a border-style utility on the base would put
 * it in a fight with the ghost variant's border that stylesheet order, not
 * the className order, would settle.
 *
 * `transform` is deliberately absent from the transition list: framer writes
 * the magnetic pull every frame, and a CSS transition on the same property
 * would re-ease each of those writes and make the button trail the pointer.
 *
 * `btn`, `btn-primary` and `btn-ghost` carry no styles of their own here —
 * they are the hooks for the layered hover in styles/button.css.
 */
const BASE =
  "btn relative isolate inline-flex items-center justify-center gap-2 rounded-control " +
  "font-medium text-text-primary whitespace-nowrap no-underline " +
  "transition-[box-shadow,border-color,background-color] duration-200 ease-[ease]";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "btn-primary bg-[image:var(--gradient-brand)]",
  ghost: "btn-ghost bg-glass-strong border border-border-glass",
};

/**
 * Padding is resolved to exactly one value rather than layered.
 *
 * The stylesheet this replaced relied on `.btn-lg` being written after
 * `.btn-primary` to win the padding. Utilities have no such guarantee — two
 * padding classes in one string are settled by the order Tailwind happens to
 * emit them, not by the order they appear in the className. So the large size
 * owns its padding outright and the variants only supply theirs at `md`.
 */
const SIZE_CLASS: Record<ButtonSize, string> = {
  md: "text-nav",
  // leading-[normal] is not cosmetic: the token pairs --text-body with a 1.6
  // line-height, but the rule this replaced set font-size alone, so the large
  // CTA measured 49px tall. Without this it grows to 54px.
  lg: "px-7 py-[15px] text-body leading-[normal]",
};

const VARIANT_PADDING: Record<ButtonVariant, string> = {
  primary: "px-6 py-2.5",
  ghost: "px-[22px] py-2.5",
};

/**
 * The magnetic pull: the button follows this fraction of the pointer's
 * distance from its centre, capped so a wide button never wanders. Small on
 * purpose — it should feel like the button noticed you, not like it moved.
 */
const MAGNET_PULL = 0.2;
const MAGNET_MAX = 6;
const MAGNET_SPRING = { stiffness: 320, damping: 22, mass: 0.5 };

const pull = (distance: number) =>
  Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, distance * MAGNET_PULL));

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The tactile layer lives in the primitive so every CTA on the page reacts
 * the same way: a slight magnetic lean toward the pointer, a firm compression
 * on press, and the hover in styles/button.css — a label roll, an arrow swap
 * and a spotlight that follows the cursor.
 *
 * The spotlight position is written straight to CSS custom properties on the
 * element, so tracking the pointer never re-renders React.
 */
export function Button({
  variant = "primary",
  size = "md",
  arrow = false,
  magnetic = true,
  className,
  type = "button",
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const x = useSpring(0, MAGNET_SPRING);
  const y = useSpring(0, MAGNET_SPRING);
  const canPull = magnetic && !reduceMotion;

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);
    const button = event.currentTarget;
    const box = button.getBoundingClientRect();
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;
    button.style.setProperty("--mx", `${px}px`);
    button.style.setProperty("--my", `${py}px`);

    // Mouse only: on touch there is no hover to lean into, and the pull
    // would just nudge the button under a finger that is already on it.
    if (canPull && event.pointerType === "mouse") {
      x.set(pull(px - box.width / 2));
      y.set(pull(py - box.height / 2));
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    x.set(0);
    y.set(0);
  };

  // The roll needs an exact duplicate of the label, which only plain text
  // can guarantee. Anything richer renders as-is, without the roll.
  const rolls = typeof children === "string";

  return (
    <motion.button
      type={type}
      className={cn(
        BASE,
        VARIANT_CLASS[variant],
        size === "md" && VARIANT_PADDING[variant],
        SIZE_CLASS[size],
        className,
      )}
      style={{ x, y, ...style }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.6 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      {...props}
    >
      <span className="btn-glow" aria-hidden="true" />

      {rolls ? (
        <span className="btn-label">
          <span>{children}</span>
          {/* Hidden from assistive tech, so the name is read once. */}
          <span aria-hidden="true">{children}</span>
        </span>
      ) : (
        children
      )}

      {arrow && (
        <span className="btn-arrow" aria-hidden="true">
          <ArrowGlyph />
          <ArrowGlyph />
        </span>
      )}
    </motion.button>
  );
}
