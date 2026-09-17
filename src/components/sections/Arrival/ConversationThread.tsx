"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

import { arrivalThread, type ThreadMessage } from "@/lib/site-config";

import { SCORE } from "./score";

export interface ConversationThreadProps {
  /** 0 -> 1 across the whole pinned runway. */
  progress: MotionValue<number>;
  /** True when the section is rendering as a static composition. */
  isStatic: boolean;
}

/**
 * Beats 01-03: an ordinary conversation that arrives, stalls, and is pulled
 * into a single point.
 *
 * The pull is one `scale` on this wrapper rather than a per-bubble journey to
 * a measured centre: the wrapper's transform origin *is* the collapse point,
 * so every bubble converges on it for the cost of one transform, with no
 * layout reads. The bubbles only add a small horizontal drift of their own so
 * it reads as a squeeze rather than a uniform shrink.
 */
export function ConversationThread({
  progress,
  isStatic,
}: ConversationThreadProps) {
  const scale = useTransform(progress, SCORE.collapse, [1, 0.06]);
  const stallOpacity = useTransform(progress, SCORE.stall, [0, 1, 1, 0]);

  return (
    <motion.div
      className="arrival-thread"
      style={isStatic ? undefined : { scale }}
    >
      <ul className="arrival-thread-list" aria-label="An ordinary text message thread">
        {arrivalThread.map((message, index) => (
          <ThreadBubble
            key={message.id}
            message={message}
            index={index}
            progress={progress}
            isStatic={isStatic}
          />
        ))}
      </ul>

      <motion.p
        className="arrival-thread-meta"
        style={isStatic ? undefined : { opacity: stallOpacity }}
      >
        Seen 2h ago
      </motion.p>
    </motion.div>
  );
}

interface ThreadBubbleProps {
  message: ThreadMessage;
  index: number;
  progress: MotionValue<number>;
  isStatic: boolean;
}

/**
 * One message. Its own component so each bubble can own its hooks — the same
 * reason `RoomScene` is a component rather than a loop body.
 *
 * The grey is authored, never `filter: grayscale()`: a filter on an element
 * that is also being scaled repaints it every frame, and the DNA canvas is
 * repainting behind all of this.
 */
function ThreadBubble({ message, index, progress, isStatic }: ThreadBubbleProps) {
  const enterStart = SCORE.bubbleIn + index * SCORE.bubbleStep;
  const enterEnd = enterStart + SCORE.bubbleDur;
  const [outStart, outEnd] = SCORE.bubbleOut;
  const leaveStart = outStart + index * SCORE.bubbleOutStep;
  const leaveEnd = outEnd + index * SCORE.bubbleOutStep;

  const stops = [enterStart, enterEnd, leaveStart, leaveEnd];

  const opacity = useTransform(progress, stops, [0, 1, 1, 0]);
  const y = useTransform(progress, [enterStart, enterEnd], [16, 0]);
  // Inbound bubbles sit left and outbound right, so each drifts toward the
  // centre line as the thread is pulled in.
  const drift = message.from === "them" ? 26 : -26;
  const x = useTransform(progress, [leaveStart, leaveEnd], [0, drift]);

  return (
    <motion.li
      className="arrival-bubble"
      data-from={message.from}
      style={isStatic ? undefined : { opacity, y, x }}
    >
      {message.text}
    </motion.li>
  );
}
