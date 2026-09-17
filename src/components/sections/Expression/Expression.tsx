"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * The five expression clips, read off `public/expression-video-slider/`.
 *
 * The filenames contain spaces, so every `src` is encoded — an unencoded
 * space does not survive being handed to the browser as a resource URL. The
 * files themselves are untouched.
 *
 * All five are 1440x1440 and 5.17s. Four are full-body characters, one
 * ("funny") is a close-up, which is why the cards crop width rather than
 * height: a 4:5 box over a square source trims 10% off each side and keeps
 * every character head to toe.
 */
interface Clip {
  readonly id: string;
  readonly src: string;
  readonly mood: string;
}

const clip = (file: string, mood: string): Clip => ({
  id: file,
  src: `/expression-video-slider/${encodeURIComponent(file)}.mp4`,
  mood,
});

const BORED = clip("Feeling Bored1", "Bored");
const SAD = clip("feeling sad", "Sad");
const FUNNY = clip("funny", "Amused");
const THINKING = clip("thinking", "Thinking");
const VIBING = clip("vibing on music", "Vibing");

/** Nothing is drawn on a clip. The wall is the image; there is no card. */
interface Card {
  readonly clip: Clip;
}

interface Column {
  readonly id: string;
  readonly direction: "up" | "down";
  /** Seconds for one full pass. Deliberately not equal, so the three
      columns never fall into step with each other. */
  readonly duration: number;
  readonly cards: readonly Card[];
  /** Dropped on narrow screens, where two opposing columns carry the idea. */
  readonly wideOnly?: boolean;
}

const COLUMNS: readonly Column[] = [
  {
    id: "a",
    direction: "up",
    duration: 46,
    cards: [{ clip: BORED }, { clip: FUNNY }, { clip: THINKING }],
  },
  {
    id: "b",
    direction: "down",
    duration: 54,
    cards: [{ clip: VIBING }, { clip: SAD }, { clip: FUNNY }],
  },
  {
    id: "c",
    direction: "up",
    duration: 50,
    wideOnly: true,
    cards: [{ clip: THINKING }, { clip: VIBING }, { clip: BORED }],
  },
];

/*
 * No border and no shadow on the card. Both drew a hard rectangle around
 * every clip, so the wall read as slabs with cut edges instead of video
 * sliding into shadow. The only shadow in this section is the pair of scrims
 * over the whole gallery.
 */
const CARD =
  "expr-card group relative aspect-[4/5] overflow-hidden rounded-[clamp(14px,1.4vw,22px)] " +
  "bg-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03]";

/**
 * S5 — EXPRESSION.
 *
 * A moving wall of avatar moments: three columns of looping clips drifting in
 * opposing directions, fading into darkness at both ends so the stream reads
 * as continuing past the section.
 *
 * ## How the movement works, and why it is CSS
 *
 * Each column holds its cards twice and animates `translateY` between 0 and
 * -50% (or the reverse). At -50% the second copy sits exactly where the first
 * began, so the loop has no seam and needs no measurement, no scroll input
 * and no per-frame JavaScript. It is a transform-only CSS animation, which
 * the compositor runs without touching the main thread — the DNA canvas is
 * repainting behind this and must not be slowed by it.
 *
 * **The gap lives on the cards, not on the flex container.** A `gap` would
 * leave `2n - 1` gaps in a strip of `2n` cards, so -50% would land half a gap
 * off and the loop would visibly jump. `margin-bottom` on every card makes
 * the strip exactly `2n x (card + gap)` and -50% exactly one repeat.
 *
 * Movement is independent of scroll on purpose: tying it to scroll would let
 * a fast flick set the rhythm, and the rhythm is the point.
 *
 * ## Playback: exactly one clip plays, and it is the one you are looking at
 *
 * **The cap is one, and it is measured, not chosen.** Steady-state DNA canvas
 * frame rate with this section on screen, GPU decoding enabled:
 *
 * | clips playing | DNA canvas |
 * |---|---|
 * | 0 | 60fps |
 * | 1 | 60fps, sustained |
 * | 2 | 30fps |
 * | 3+ | 30fps, every time |
 *
 * There is no gentle slope: the second clip halves the page. The cause is the
 * source. Every clip is 1440x1440 — 2.1 megapixels, twice a Rooms clip
 * (1536x672) — and is drawn about 315px wide, so it decodes roughly twenty
 * times the pixels it paints. Rooms holds 60fps on the same page with one
 * clip of half the size, which is the budget this page has. The files are the
 * client's and are not ours to re-encode; if they are ever re-exported at
 * display size, raise this number and re-measure.
 *
 * A cap of one turned out to be the better design anyway. The columns drift
 * continuously — that is the section's real movement, and it is free — while
 * the card nearest the middle of the viewport comes alive and settles back to
 * a still as it drifts away. One moment animating where you are looking reads
 * better than ten competing for attention.
 */
const MAX_PLAYING = 1;

export function Expression() {
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isStatic = reduceMotion === true;

  useEffect(() => {
    const root = galleryRef.current;
    const section = sectionRef.current;
    if (!root || !section) return;

    const videos = Array.from(root.querySelectorAll("video"));
    /** Cards currently crossing the focus band. */
    const inBand = new Set<HTMLVideoElement>();
    let sectionVisible = false;

    /*
      Attaching the source here rather than in JSX is deliberate. Rendering
      `src` on all eighteen cards had all eighteen downloaded and decoded the
      moment the section approached — including the third column, which is
      display:none on a phone and would never be seen. A hidden element never
      intersects, so it now never loads. React never writes `src`, so there is
      no reconciliation to fight over.
    */
    const arm = (video: HTMLVideoElement) => {
      if (!video.getAttribute("src") && video.dataset.src) {
        video.preload = "auto";
        video.src = video.dataset.src;
      }
    };

    const apply = () => {
      /*
        Distance is read here rather than cached from the entry, because the
        cards are drifting: a distance recorded when a card entered the band
        is wrong by the time it reaches the middle, and a card that entered at
        the far edge would stay permanently deprioritised. This measures only
        the two-to-four cards currently in the band, and only when the
        observer fires — never per frame.
      */
      const middle = window.innerHeight / 2;
      const chosen = new Set(
        [...inBand]
          .map((video): [HTMLVideoElement, number] => {
            const box = video.getBoundingClientRect();
            return [video, Math.abs(box.top + box.height / 2 - middle)];
          })
          .sort((a, b) => a[1] - b[1])
          .slice(0, MAX_PLAYING)
          .map(([video]) => video),
      );

      for (const video of videos) {
        // Reduced motion arms every visible clip so its first frame paints
        // and stops there: a wall of looping video is moving content.
        if (sectionVisible && chosen.has(video) && !isStatic) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      }
    };

    /*
      The focus band. Shrinking the root to the middle of the viewport is what
      selects candidates without any scroll listener or per-frame measuring —
      `entry.boundingClientRect` comes free with the callback, so ranking them
      costs no layout read either.
    */
    const focus = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) inBand.add(video);
          else inBand.delete(video);
        }
        apply();
      },
      { rootMargin: "-34% 0px -34% 0px" },
    );

    /** A wider pass that only loads, so a card has decoded before it shows. */
    const preloader = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) arm(entry.target as HTMLVideoElement);
      },
      { rootMargin: "25% 0px" },
    );

    /*
      Nothing plays once the section is gone. Without this the clips kept
      running behind the next section and held the page at 30fps well past
      the point anyone could see them.
    */
    const gate = new IntersectionObserver(
      (entries) => {
        sectionVisible = entries[0]?.isIntersecting ?? false;
        apply();
      },
      { threshold: 0 },
    );

    for (const video of videos) {
      focus.observe(video);
      preloader.observe(video);
    }
    gate.observe(section);

    return () => {
      focus.disconnect();
      preloader.disconnect();
      gate.disconnect();
    };
  }, [isStatic]);

  return (
    <section
      ref={sectionRef}
      id="expression"
      aria-labelledby="expression-title"
      className="relative z-10 overflow-hidden px-[var(--container-gutter)] pt-[clamp(48px,7vh,96px)] pb-0"
    >
      {/* Ambient purple/cyan wash. Painted gradients, never a blurred layer —
          a filter here would re-rasterise against the moving columns. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[22%] bottom-0 bg-[radial-gradient(62%_50%_at_16%_34%,rgba(168,85,247,0.13),transparent_70%),radial-gradient(56%_46%_at_86%_70%,rgba(56,189,248,0.1),transparent_68%)]"
      />

      <div className="relative z-[2] mx-auto w-[min(var(--stage-max),100%)] text-center">
        <p
          data-aos="knocka-rise"
          className="mb-[clamp(14px,1.4vw,20px)] text-caption font-medium tracking-[0.24em] text-accent-lilac uppercase"
        >
          Express yourself
        </p>

        <h2
          id="expression-title"
          data-aos="knocka-heading"
          className="mx-auto max-w-[15ch] font-display text-[clamp(32px,min(5.4vw,8vh),74px)]/[0.94] font-[900] tracking-[-0.042em] text-balance uppercase delay-[60ms]"
        >
          Your face. Your mood.{" "}
          <span
            className="text-gradient"
            style={
              {
                "--gradient":
                  "linear-gradient(100deg, var(--color-accent-purple), var(--color-accent-magenta), var(--color-accent-cyan))",
              } as CSSProperties
            }
          >
            Your moment.
          </span>
        </h2>

        <p
          data-aos="knocka-rise"
          className="mx-auto mt-[clamp(16px,1.8vw,26px)] max-w-[46ch] text-[clamp(14px,1.05vw,17px)]/[1.6] text-text-secondary text-balance delay-[120ms]"
        >
          Sometimes a text isn&apos;t enough. Let your avatar show how you feel.
        </p>
      </div>

      {/*
        role="img" with one label rather than eighteen announced elements: the
        wall is illustration, and the section's message is already in the
        heading and the line above.
      */}
      <div
        ref={galleryRef}
        role="img"
        aria-label="Knocka avatars reacting — bored, sad, amused, thinking and vibing to music"
        data-aos="knocka-zoom"
        /*
          The gap under the copy was 55px, which read as the wall crowding the
          headline rather than sitting beneath it. It is now 100-150px on
          desktop, and the wall is both wider and taller so it runs past the
          viewport and dissolves through the scrims at both ends.

          overflow-hidden is load-bearing. Each strip is translated by up to
          -50% of its own height, and without a clip here those cards render
          outside the gallery entirely -- straight over the headline, above
          the top scrim where nothing can fade them. The clip edge itself is
          never visible because the scrims have already taken the content to
          full black well before it.
        */
        className="expr-gallery relative z-[1] mx-auto mt-[clamp(56px,11vh,150px)] flex h-[clamp(500px,90vh,1000px)] w-[min(1120px,100%)] gap-[clamp(10px,1.2vw,18px)] overflow-hidden delay-[180ms]"
      >
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className={
              "expr-col relative min-w-0 flex-1" +
              (column.wideOnly ? " upto-760:hidden" : "")
            }
          >
            <div
              className="expr-strip"
              data-dir={column.direction}
              style={
                {
                  "--expr-dur": `${column.duration}s`,
                } as CSSProperties
              }
            >
              {/* The strip carries its cards twice; -50% lands on the seam. */}
              {[0, 1].map((copy) =>
                column.cards.map((card, index) => (
                  <div
                    key={`${copy}-${card.clip.id}-${index}`}
                    // The duplicated half exists only to make the loop
                    // seamless, so reduced motion drops it and leaves one
                    // still column per track.
                    className={copy === 1 ? `${CARD} motion-reduce:hidden` : CARD}
                    data-clone={copy === 1 ? "true" : undefined}
                  >
                    <video
                      className="h-full w-full object-cover"
                      data-src={card.clip.src}
                      preload="none"
                      muted
                      loop
                      playsInline
                      tabIndex={-1}
                      disablePictureInPicture
                    />

                    {/* Rest-state dim, lifted on hover. An opacity change on an
                        overlay, not a brightness filter on the video. */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-black/25 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-0"
                    />

                  </div>
                )),
              )}
            </div>
          </div>
        ))}
        {/*
          The curtain. Two painted scrims rather than a mask on the container —
          see expression.css. Deep enough that clips are already dissolving
          before they reach either edge, so the wall reads as continuing past
          the section rather than stopping at it.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-[30%] bg-[linear-gradient(to_bottom,var(--color-void)_0%,rgba(3,3,5,0.92)_30%,rgba(3,3,5,0.55)_62%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-[28%] bg-[linear-gradient(to_top,var(--color-void)_0%,rgba(3,3,5,0.92)_30%,rgba(3,3,5,0.55)_62%,transparent_100%)]"
        />
      </div>
    </section>
  );
}
