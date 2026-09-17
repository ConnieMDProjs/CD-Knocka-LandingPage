"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import type { Room } from "@/lib/site-config";

export interface RoomProgressProps {
  rooms: readonly Room[];
  active: number;
  progress: MotionValue<number>;
}

interface SegmentProps {
  index: number;
  total: number;
  progress: MotionValue<number>;
}

/** Fills between two ordinals as the camera crosses from one world to the next. */
function Segment({ index, total, progress }: SegmentProps) {
  const band = 1 / total;
  const from = (index + 0.5) * band;
  const to = (index + 1.5) * band;
  const scaleX = useTransform(progress, [from, to], [0, 1], { clamp: true });

  return (
    <span className="relative ml-3.5 block h-px w-[clamp(26px,4.5vw,62px)] overflow-hidden bg-[rgba(255,255,255,0.14)]">
      {/* origin-left is what makes the rule grow from the previous ordinal
          rather than from its own middle. scaleX is the motion value. */}
      <motion.span
        className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--color-accent-purple),var(--color-accent-cyan))]"
        style={{ scaleX }}
      />
    </span>
  );
}

/**
 * Ordinals joined by scroll-linked rules. Reads as a chapter marker in the
 * composition rather than carousel dots.
 *
 * The three ordinal states are `data-*` variants rather than an attribute
 * selector in a stylesheet, so the state and the styling that responds to it
 * are declared in the same place. Only one state matches at a time, so the
 * two overrides cannot collide.
 */
export function RoomProgress({ rooms, active, progress }: RoomProgressProps) {
  return (
    <div className="flex flex-none items-center pt-2.5" aria-hidden="true">
      {rooms.map((room, index) => (
        <span className="inline-flex items-center gap-3.5" key={room.id}>
          {index > 0 && (
            <Segment index={index - 1} total={rooms.length} progress={progress} />
          )}
          <span
            className={
              "font-display text-[12px] font-[500] tracking-[0.2em] " +
              "text-[rgba(255,255,255,0.26)] transition-[color] duration-500 ease-[ease] " +
              "data-[state=past]:text-[rgba(255,255,255,0.5)] " +
              "data-[state=active]:text-text-primary"
            }
            data-state={
              index === active ? "active" : index < active ? "past" : "upcoming"
            }
          >
            {room.ordinal}
          </span>
        </span>
      ))}
    </div>
  );
}
