export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface PrimaryNavLink extends NavLink {
  /**
   * False while the target section does not exist yet. Unready links stay in
   * the list so the intended navigation is visible in one place, but they are
   * never rendered — a link that scrolls nowhere is a broken link. The phase
   * that builds each section flips its flag.
   */
  readonly ready: boolean;
}

export const siteConfig = {
  name: "Knocka",
  title: "Knocka — Feel the Message",
  description:
    "Messages that feel human. Express yourself with emotion, voice, movement and presence.",
} as const;

/**
 * The full intended navigation, in final order — page order, top to bottom.
 *
 * Every entry points at a section that is actually on the page, so every
 * label in the bar goes somewhere. The hero is deliberately absent: the
 * wordmark is already the way back to the top.
 *
 * Anchors rely on `scroll-margin-top` in base.css to clear the floating
 * header; without it every jump lands with the section heading tucked
 * behind the bar.
 */
export const navLinks: readonly PrimaryNavLink[] = [
  // S2, the flat-to-arrival sequence. It was labelled "Flow & Motivi", which
  // was never resolved with the client and told a visitor nothing.
  { label: "Why Knocka", href: "#arrival", ready: true },
  // The film sits between the argument (S2) and the how-to.
  { label: "Watch", href: "#film", ready: true },
  { label: "How it works", href: "#how", ready: true },
  { label: "Rooms", href: "#rooms", ready: true },
  { label: "Expressions", href: "#expression", ready: true },
  // Target section S5 is not built.
  { label: "Modes", href: "#modes", ready: false },
  // Retained pending client confirmation on whether the page has an FAQ.
  { label: "FAQ", href: "#faq", ready: false },
];

/** The only links safe to render today. */
export const activeNavLinks: readonly NavLink[] = navLinks.filter(
  (link) => link.ready,
);

export interface FooterGroup {
  readonly title: string;
  readonly links: readonly NavLink[];
}

/**
 * Footer navigation. The "Explore" group mirrors the header — and, like the
 * header, lists only sections that actually exist. The rest are placeholder
 * destinations (href "#") until those pages exist.
 */
export const footerGroups: readonly FooterGroup[] = [
  { title: "Explore", links: activeNavLinks },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press kit", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Safety", href: "#" },
    ],
  },
];

export const socialGroup: FooterGroup = {
  title: "Social",
  links: [
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "X", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

export interface Room {
  readonly id: string;
  readonly ordinal: string;
  readonly name: string;
  readonly line: string;
  readonly video: string;
  /** Portal glow for this world. The three step through the brand gradient. */
  readonly glow: string;
}

export const rooms: readonly Room[] = [
  {
    id: "coffee-shop",
    ordinal: "01",
    name: "Coffee shop",
    line: "Slow conversations.",
    video: "/videos/Coffee-Shop1.mp4",
    glow: "168, 85, 247",
  },
  {
    id: "disco-club",
    ordinal: "02",
    name: "Disco club",
    line: "Turn the moment up.",
    video: "/videos/Disco-Club1.mp4",
    glow: "236, 72, 153",
  },
  {
    id: "ice-cream-shop",
    ordinal: "03",
    name: "Ice cream shop",
    line: "Just hanging out.",
    video: "/videos/Ice-Cream-Shop1.mp4",
    glow: "56, 189, 248",
  },
];

/* ---------------------------------------------------------------
   The film — the 30-second story, between S2 and How it works
--------------------------------------------------------------- */

export interface FilmChapter {
  readonly title: string;
  readonly line: string;
  /** Seconds into the film where this chapter begins. */
  readonly start: number;
}

/**
 * The Knocka story film.
 *
 * `chapters` are read off the cut itself, not the script: the script's scene
 * timings drifted in the edit (the pulse lands at 0:05, not 0:04; the knock
 * starts at 0:12, not 0:09; the reply scene was cut). If the film is
 * re-edited, re-check these against a frame per second.
 *
 * The poster is the 0:12.5 frame — the knock on the glass with the three
 * open options, which is the whole product in one image.
 */
export const storyFilm = {
  src: "/Knocka-Story-Video1.mp4",
  poster: "/film/knocka-film-poster.jpg",
  /** The source is 1024x768. */
  ratio: "4 / 3",
  /** Seconds. Replaced by the file's own duration once metadata loads. */
  duration: 29.4,
  alt: "The Knocka film: Jessica sends her good news as a Knocka, and her avatar knocks on her friend's screen to tell him herself.",
  chapters: [
    {
      title: "Send",
      line: "Jessica gets the job. Her avatar is as excited as she is.",
      start: 0,
    },
    {
      title: "Travel",
      line: "The message leaves as a Knocka and lands on his phone.",
      start: 5,
    },
    {
      title: "Knock",
      line: "Her avatar knocks from inside his screen. He picks Experience.",
      start: 12,
    },
    {
      title: "Arrive",
      line: "She tells him herself — and they celebrate together.",
      start: 18,
    },
  ] satisfies readonly FilmChapter[],
} as const;

/* ---------------------------------------------------------------
   S2 — The Flat -> The Arrival
--------------------------------------------------------------- */

export interface ThreadMessage {
  readonly id: string;
  /** "them" renders left-aligned, "you" right-aligned. */
  readonly from: "them" | "you";
  readonly text: string;
}

/**
 * The ordinary conversation S2 opens on. Deliberately dull and deliberately
 * short — this is a sketch of texting, not a messaging-app clone.
 *
 * TEMPORARY COPY. Placeholder dialogue chosen to be universally recognisable;
 * not client-approved. See docs/LANDING_PAGE_STRATEGY.md.
 */
export const arrivalThread: readonly ThreadMessage[] = [
  { id: "m1", from: "you", text: "hey" },
  { id: "m2", from: "them", text: "hey" },
  { id: "m3", from: "you", text: "what's up?" },
  { id: "m4", from: "them", text: "nothing much" },
  { id: "m5", from: "you", text: "you free later?" },
  { id: "m6", from: "them", text: "idk" },
  { id: "m7", from: "you", text: "lol" },
  { id: "m8", from: "them", text: "k" },
];

interface ArrivalMediaBase {
  readonly src: string;
  readonly alt: string;
  /** Frame aspect ratio, as a CSS `aspect-ratio` value. */
  readonly ratio: string;
}

export type ArrivalMediaSource =
  | (ArrivalMediaBase & {
      readonly kind: "image";
      readonly width: number;
      readonly height: number;
    })
  | (ArrivalMediaBase & {
      readonly kind: "video";
      readonly poster?: string;
      /** Seconds from playback start to each of the two knock marks. */
      readonly knockBeats: readonly [number, number];
    });

/**
 * What arrives in S2's frame.
 *
 * The client replaced the knocking welcome video with the transparent
 * Knocka avatar logo. With a still image, the knock pulse fires at the
 * scroll threshold (see score.ts).
 *
 * `ratio` is the frame's shape, not the asset's: the logo (615x512) is
 * contained inside a square frame.
 */
export const arrivalMedia: ArrivalMediaSource = {
  kind: "image",
  src: "/branding/knocka-avatar-logo.png",
  alt: "The Knocka avatar arriving through a message frame",
  ratio: "1 / 1",
  width: 615,
  height: 512,
};
