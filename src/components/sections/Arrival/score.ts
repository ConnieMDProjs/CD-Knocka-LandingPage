import { arrivalMedia } from "@/lib/site-config";

/**
 * S2's score.
 *
 * Every number here is a fraction of the pinned runway, and the whole section
 * is driven from this one file so the beats cannot drift apart: the thread
 * has to finish collapsing before the spark fires, the spark has to fire
 * before the frame opens, and the scrim has to be gone before either reads.
 *
 * **Every stop must stay inside [0, 1].** Framer Motion v13 hands
 * scroll-linked transforms to the browser as native WAAPI animations, where
 * the input range becomes the keyframe offsets; a stop below 0 or above 1
 * throws "Offsets must be monotonically non-decreasing" at mount and takes
 * the whole tree down. See docs/LANDING_PAGE_AGENT.md.
 *
 * ## The shape of it
 *
 * The flat half now owns roughly **two thirds of the runway**, up from a
 * little under half. That is the point of the section: the boredom has to be
 * felt for long enough to be worth answering, so eight messages build, the
 * thread goes quiet, and "Seen 2h ago" sits there for a long stretch of
 * scrolling before anything happens. The turn is unchanged in character —
 * only in where it starts.
 */
export const SCORE = {
  /** Bubble i enters at `bubbleIn + i * bubbleStep`, over `bubbleDur`. */
  bubbleIn: 0.015,
  bubbleStep: 0.035,
  bubbleDur: 0.045,
  /** ...and leaves on the collapse, offset by the same per-bubble step. */
  bubbleOut: [0.55, 0.64],
  bubbleOutStep: 0.008,

  /**
   * "Seen 2h ago": in, hold, out. The thread stalls here, and this is the
   * long one — the dead air is the argument.
   */
  stall: [0.33, 0.4, 0.54, 0.6],

  /** Headline A, "Text is flat and boring." */
  flatLine: [0.28, 0.36, 0.54, 0.6],

  /** The whole thread is pulled into a single point. */
  collapse: [0.56, 0.7],

  /** What the thread collapses into, and what the frame opens out of. */
  spark: [0.64, 0.71, 0.78],

  /** The plate over the DNA field lifts. This is the section's turn. */
  scrim: [0.64, 0.78],

  /** Brand bloom behind the arrival. Holds at part strength to the end. */
  bloom: [0.66, 0.8, 1],

  /** The arrival frame opens out of the spark. */
  frame: [0.7, 0.82],

  /** Headline B, "What if someone knocks on your phone?" */
  arriveLine: [0.8, 0.88],

  /** The supporting line under it. */
  arriveSub: [0.84, 0.91],

  /** "That's the difference." — the breath before S3. */
  closer: [0.93, 0.985],

  /**
   * Thresholds, not ranges. Armed on the way down and disarmed on the way
   * back up; the gap between them is hysteresis, so a scroll that hovers on
   * the boundary cannot retrigger the sequence every frame.
   *
   * `arriveAt` sits inside the frame's opening range rather than before it,
   * because what arrives now is a video that knocks: starting it while the
   * frame is still a point would spend the knock off-screen.
   */
  arriveAt: 0.78,
  arriveReset: 0.7,
};

/**
 * Exactly two knocks, and they are the video's own.
 *
 * This used to be an invented rhythm — scroll armed the sequence, a timer
 * performed it — because the frame held a still image. It now holds the
 * welcome video, whose audio has six knock transients (0.39, 0.77, 1.04,
 * 1.30, 1.64, 1.96s, measured off the decoded track).
 *
 * The two "Knock" labels that used to ride these beats were removed at the
 * client's request; what remains on them is the frame kick and the edge
 * flash, so the page still reacts to the first two real hits without
 * captioning them. Nothing here adds a knock of its own.
 *
 * Timed from the moment playback actually starts, not from the scroll
 * threshold that requests it — see `onPlaybackStart` in ArrivalMedia.
 */
export const KNOCK_BEATS: readonly number[] =
  arrivalMedia.kind === "video" ? [...arrivalMedia.knockBeats] : [0, 0.34];

/**
 * One impulse track carrying both hits, for the pulses that ride along with
 * the marks (frame kick, edge flash). Derived from KNOCK_BEATS so the kick
 * can never drift away from the mark it belongs to.
 */
const PULSE_DURATION = Math.max(1.2, KNOCK_BEATS[1] + 0.7);
const at = (seconds: number) =>
  Math.min(1, Math.max(0, +(seconds / PULSE_DURATION).toFixed(3)));

export const KNOCK_PULSE = {
  duration: PULSE_DURATION,
  /** start, hit 1, recover, hold, hit 2, settle — all inside [0, 1]. */
  times: [
    0,
    at(KNOCK_BEATS[0]),
    at(KNOCK_BEATS[0] + 0.13),
    at(KNOCK_BEATS[1] - 0.13),
    at(KNOCK_BEATS[1]),
    1,
  ],
};
