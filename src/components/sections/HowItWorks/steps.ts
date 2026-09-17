/**
 * The four-and-a-fifth things that happen between installing Knocka and
 * knocking on someone's phone.
 *
 * The zigzag is data, not markup: each step declares which side it sits on
 * and how far it is rotated, and the connector between them is *derived*
 * from those sides in `snake()`. That is what keeps the dashed line and the
 * cards from drifting apart — there is one source for where a card is, and
 * the line reads it.
 */

export type Art = "selfie" | "avatar" | "message" | "room" | "knock";

export interface Step {
  readonly id: string;
  readonly n: string;
  readonly title: string;
  readonly line: string;
  readonly art: Art;
  /** The ground behind the card. Every one is different. */
  readonly tint: string;
  readonly ring: string;
  /** Degrees. Hover takes every card back to 0. */
  readonly rot: number;
}

export const STEPS: readonly Step[] = [
  {
    id: "selfie",
    n: "01",
    title: "Upload a selfie",
    line: "One photo, front camera, no studio. That is everything we need to start.",
    art: "selfie",
    tint: "linear-gradient(150deg, #38bdf8 0%, #1d4ed8 100%)",
    ring: "rgba(125, 211, 252, 0.5)",
    rot: -4,
  },
  {
    id: "avatar",
    n: "02",
    title: "Make your avatar",
    line: "Skin, hair, brows, style. Tune it until the face in the app is the one people know.",
    art: "avatar",
    tint: "linear-gradient(150deg, #c084fc 0%, #6d28d9 100%)",
    ring: "rgba(216, 180, 254, 0.5)",
    rot: 3.5,
  },
  {
    id: "message",
    n: "03",
    title: "Say it with your face",
    line: "Your avatar carries the message and performs it — your words, your voice, your expression.",
    art: "message",
    tint: "linear-gradient(150deg, #f472b6 0%, #a21caf 100%)",
    ring: "rgba(249, 168, 212, 0.5)",
    rot: -2.5,
  },
  {
    id: "room",
    n: "04",
    title: "Open a room",
    line: "Pick a place, invite your people, and hang out in it as avatars instead of as a group chat.",
    art: "room",
    tint: "linear-gradient(150deg, #7dd3fc 0%, #4338ca 100%)",
    ring: "rgba(129, 140, 248, 0.5)",
    rot: 4,
  },
  {
    id: "knock",
    n: "05",
    title: "Knock their phone",
    line: "When a message is not enough, knock. It lands on their phone and they feel it.",
    art: "knock",
    tint: "linear-gradient(150deg, #f9a8d4 0%, #be123c 100%)",
    ring: "rgba(253, 164, 175, 0.5)",
    rot: -3,
  },
];

/** Which column a step sits in. Left, right, left, right… */
export const sideOf = (index: number): "left" | "right" =>
  index % 2 === 0 ? "left" : "right";

/**
 * The dashed connectors, derived from the sides above — one short curve per
 * hop rather than one long snake.
 *
 * The long version was drawn and then almost entirely hidden: it ran through
 * the CENTRES of the cards, which are opaque, so all that showed was a stub
 * in each gap. These hop between the gutter positions instead, so each curve
 * crosses the open space between two cards and only its two ends tuck under
 * them.
 *
 * Drawn into a 0-100 by 0-100 viewBox with `preserveAspectRatio="none"`, so
 * they stretch to whatever the track measures without anything being read
 * from the DOM. `vectorEffect="non-scaling-stroke"` is what keeps the dashes
 * even under that stretch — without it they smear horizontally.
 */
const hops = (count: number, left: number, right: number): string[] => {
  const edge = 100 / count;
  const reach = Math.min(9, edge * 0.42);

  return Array.from({ length: count - 1 }, (_, i) => {
    const seam = (i + 1) * edge;
    const xa = sideOf(i) === "left" ? left : right;
    const xb = sideOf(i + 1) === "left" ? left : right;
    const lift = reach * 1.1;
    return `M${xa} ${(seam - reach).toFixed(2)} C${xa} ${(seam - reach + lift).toFixed(2)} ${xb} ${(seam + reach - lift).toFixed(2)} ${xb} ${(seam + reach).toFixed(2)}`;
  });
};

/** The wide zigzag, and the narrow wave. */
export const WIDE_HOPS = hops(STEPS.length, 34, 66);
export const NARROW_HOPS = hops(STEPS.length, 42, 58);

/** Where an arrow sits on each hop: on the seam, and dead centre. */
export const ARROWS = STEPS.slice(0, -1).map((_, i) => ({
  key: `${i}`,
  y: (((i + 1) * 100) / STEPS.length).toFixed(2),
  /** Points the way the line is travelling on this hop. */
  rot: sideOf(i) === "left" ? 38 : -38,
}));
