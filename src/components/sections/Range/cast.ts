/**
 * S3's cast: six profiles, their colours, and where each one stands.
 *
 * **Placement is data, not CSS.** Every profile carries two spots — one for
 * the wide composition and one for the narrow one — and the stylesheet picks
 * between them with a single media query. That is what lets the narrow
 * layout be a different arrangement rather than the wide one squeezed,
 * with no resize listener, no measurement and no second render path.
 *
 * **Every profile gets its own colour.** Five of the six images are cutouts
 * with real alpha, so the colour is the bubble behind them and it shows
 * through everywhere the person is not. `avatar5.jpg` is the exception — a
 * JPEG on white — so it is cropped to fill its bubble edge to edge and its
 * own white ground becomes its colour. Six people, six grounds, and nothing
 * about the markup differs between them.
 */

/** A place in the field. x/y are percentages of the stage. */
export interface Spot {
  readonly x: number;
  readonly y: number;
  /** Multiplies the base size for this kind of profile. */
  readonly s: number;
  readonly rot: number;
}

export interface Profile {
  readonly id: string;
  readonly src: string;
  /** Intrinsic size of the artwork. Display size comes from CSS. */
  readonly w: number;
  readonly h: number;
  readonly name: string;
  readonly mood: string;
  /** The ground behind the cutout. Every one of them is different. */
  readonly tint: string;
  readonly ring: string;
  /**
   * `card` is a portrait plate the person stands out of, head above the top
   * edge — only possible because the artwork is a cutout. `bubble` is a
   * circle the portrait fills.
   */
  readonly kind: "card" | "bubble";
  /**
   * Cards only. The artwork's width as a percentage of the plate, tuned per
   * image so every head clears the top edge by about the same amount: the
   * two sources have different aspect ratios and different amounts of air
   * around the subject, so one number cannot serve both.
   */
  readonly imgWidth?: number;
  /** Bubbles only. Vertical crop focus, so no head is cut off. */
  readonly focus?: number;
  /** One person is sending a voice note. */
  readonly voice?: boolean;
  readonly wide: Spot;
  readonly narrow: Spot;
  readonly delay: number;
}

const IMG = "/avatar-profile-img";

export const CAST: readonly Profile[] = [
  {
    id: "sam",
    src: `${IMG}/avatar2.png`,
    w: 408,
    h: 612,
    name: "Sam",
    mood: "Sent a voice note",
    tint: "linear-gradient(158deg, #38bdf8 0%, #1d4ed8 100%)",
    ring: "rgba(125, 211, 252, 0.55)",
    kind: "card",
    imgWidth: 104,
    voice: true,
    wide: { x: 14, y: 56, s: 1, rot: -8 },
    narrow: { x: 27, y: 76, s: 0.92, rot: -7 },
    delay: 0.12,
  },
  {
    id: "arjun",
    src: `${IMG}/avatar6.png`,
    w: 500,
    h: 500,
    name: "Arjun",
    mood: "Just joined",
    tint: "linear-gradient(158deg, #f472b6 0%, #a21caf 100%)",
    ring: "rgba(249, 168, 212, 0.55)",
    kind: "card",
    imgWidth: 142,
    wide: { x: 86, y: 50, s: 1, rot: 7 },
    narrow: { x: 73, y: 73, s: 0.92, rot: 6 },
    delay: 0.22,
  },
  {
    id: "nova",
    src: `${IMG}/avatar1.png`,
    w: 500,
    h: 500,
    name: "Nova",
    mood: "Vibing",
    tint: "linear-gradient(160deg, #c084fc 0%, #6d28d9 100%)",
    ring: "rgba(216, 180, 254, 0.5)",
    kind: "bubble",
    focus: 10,
    wide: { x: 9, y: 14, s: 0.92, rot: -6 },
    narrow: { x: 13, y: 31, s: 0.74, rot: -6 },
    delay: 0.3,
  },
  {
    id: "theo",
    src: `${IMG}/avatar3.png`,
    w: 500,
    h: 500,
    name: "Theo",
    mood: "Thinking",
    tint: "linear-gradient(160deg, #7dd3fc 0%, #4338ca 100%)",
    ring: "rgba(129, 140, 248, 0.5)",
    kind: "bubble",
    focus: 8,
    wide: { x: 90, y: 12, s: 0.72, rot: 8 },
    narrow: { x: 87, y: 27, s: 0.6, rot: 8 },
    delay: 0.38,
  },
  {
    id: "mila",
    src: `${IMG}/avatar4.png`,
    w: 612,
    h: 408,
    name: "Mila",
    mood: "Knocked back",
    tint: "linear-gradient(160deg, #f9a8d4 0%, #be123c 100%)",
    ring: "rgba(249, 168, 212, 0.5)",
    kind: "bubble",
    focus: 4,
    wide: { x: 92, y: 84, s: 0.88, rot: -7 },
    narrow: { x: 89, y: 93, s: 0.66, rot: -7 },
    delay: 0.46,
  },
  {
    id: "kai",
    // The one JPEG, and the one image with no alpha. It fills its bubble, so
    // its own white ground is its colour — the sixth of six.
    src: `${IMG}/avatar5.jpg`,
    w: 9999,
    h: 6842,
    name: "Kai",
    mood: "Online",
    tint: "#f4f4f6",
    ring: "rgba(255, 255, 255, 0.45)",
    kind: "bubble",
    focus: 12,
    wide: { x: 8, y: 86, s: 0.66, rot: 6 },
    narrow: { x: 11, y: 94, s: 0.56, rot: 6 },
    delay: 0.54,
  },
];

/**
 * The five steps, as one line of type that never stops moving.
 *
 * They are the section's argument, and putting them on the band rather than
 * in a list is what keeps them being read as a sequence — the same words
 * pass again every time the eye comes back to it.
 */
export const STEPS: readonly string[] = [
  "Find your people",
  "Invite them in",
  "Show how you feel",
  "Send your avatar",
  "Knock their phone",
];
