"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/Button";
import { storyFilm } from "@/lib/site-config";
import { scrollToTarget } from "@/lib/smooth-scroll";

/**
 * - `preview`  not started yet (or autoplay is off: reduced motion, data saver)
 * - `playing`  the film proper, with sound when the browser allows it
 * - `paused`   the film proper, stopped
 * - `ended`    the film proper, finished; the end card is up
 */
type Mode = "preview" | "playing" | "paused" | "ended";

const CHAPTERS = storyFilm.chapters;

/** Stagger for the chapter reveals. Literal strings so Tailwind sees them. */
const CHAPTER_DELAY = ["delay-[80ms]", "delay-[160ms]", "delay-[240ms]", "delay-[320ms]"];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

const chapterAt = (time: number) =>
  CHAPTERS.reduce((current, chapter, index) => (time >= chapter.start ? index : current), 0);

/** false on the server and during hydration, true after — without an effect. */
const noSubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(noSubscribe, () => true, () => false);

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

const ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

function PlayIcon() {
  return (
    <svg {...ICON} fill="currentColor" stroke="none">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg {...ICON} fill="currentColor" stroke="none">
      <rect x="6.5" y="5" width="3.6" height="14" rx="1" />
      <rect x="13.9" y="5" width="3.6" height="14" rx="1" />
    </svg>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg {...ICON}>
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" stroke="none" />
      {muted ? (
        <path d="m16 9.5 5 5m0-5-5 5" />
      ) : (
        <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.3 6.5a8 8 0 0 1 0 11" />
      )}
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg {...ICON}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Player                                                             */
/* ------------------------------------------------------------------ */

/**
 * The film, its controls and its chapters.
 *
 * **It starts itself, with sound.** Once the frame is well into view the film
 * plays from 0:00 with sound — but never under reduced motion, and never on a
 * data-saver connection, where a 13MB clip nobody requested is a real cost.
 * If the browser refuses audio (no click or key yet on the page), it plays
 * muted and unmutes on the visitor's next interaction. Out of view it pauses,
 * and back in view it resumes.
 *
 * **Clicking starts it over.** Play restarts from 0:00 (or from the chapter
 * clicked). Starting it pauses every other video on the page, because two
 * soundtracks at once is never right.
 *
 * **The chapters are the index and the scrubber.** They carry the story as
 * text — so it survives with the video off — show where the film is, and
 * jump to any beat.
 *
 * Without JavaScript the video keeps its native controls, so it still plays.
 */
export function FilmPlayer({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimer = useRef<number | undefined>(undefined);

  const [mode, setMode] = useState<Mode>("preview");
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState<number>(storyFilm.duration);
  const [idle, setIdle] = useState(false);

  // The observer below outlives renders, so it reads the mode through a ref.
  const modeRef = useRef<Mode>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  /** True when scrolling away paused the film, so scrolling back resumes it. */
  const autoPaused = useRef(false);
  /** Removes a pending unmute-on-gesture listener, if one is armed. */
  const disarmUnmute = useRef<(() => void) | undefined>(undefined);

  /*
    A browser will not play audio without a prior user gesture, and scrolling
    is not one. When sound is refused the film runs muted, and the visitor's
    next click, tap or key anywhere on the page turns the sound on.
  */
  const unmuteOnGesture = useCallback((video: HTMLVideoElement) => {
    disarmUnmute.current?.();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const run = (event: Event) => {
      // The player's own sound and play buttons handle this themselves.
      if (event.target instanceof Element && event.target.closest(".film-controls")) return;
      stop();
      if (!video.muted) return;
      video.muted = false;
      setMuted(false);
      if (video.paused && modeRef.current === "playing") {
        void video.play().catch(() => undefined);
      }
    };
    const stop = () => {
      for (const type of events) window.removeEventListener(type, run);
      disarmUnmute.current = undefined;
    };
    for (const type of events) {
      window.addEventListener(type, run, { passive: true });
    }
    disarmUnmute.current = stop;
  }, []);

  /** The film proper: from `from`, with sound when allowed, and alone. */
  const startFilm = useCallback(
    (from = 0) => {
      const video = videoRef.current;
      if (!video) return;

      for (const other of document.querySelectorAll("video")) {
        if (other !== video) other.pause();
      }

      autoPaused.current = false;
      video.loop = false;
      video.muted = false;
      video.volume = 1;
      video.currentTime = from;
      setMuted(false);
      setTime(from);
      setMode("playing");

      void video
        .play()
        .then(() => {
          // Some browsers honour play() but mute it rather than refusing.
          if (video.muted) {
            setMuted(true);
            unmuteOnGesture(video);
          }
        })
        .catch(() => {
          // Sound refused (no gesture yet): play muted rather than not at
          // all, and bring the sound in on the visitor's next interaction.
          video.muted = true;
          setMuted(true);
          unmuteOnGesture(video);
          void video.play().catch(() => setMode("paused"));
        });
    },
    [unmuteOnGesture],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    const mayAutoplay = !reduce && connection?.saveData !== true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Warm the metadata as soon as any of the frame shows.
        if (entry.isIntersecting && video.preload === "none") video.preload = "metadata";

        if (entry.intersectionRatio >= 0.35) {
          if (modeRef.current === "preview" && mayAutoplay) {
            startFilm(0);
          } else if (modeRef.current === "paused" && autoPaused.current) {
            autoPaused.current = false;
            for (const other of document.querySelectorAll("video")) {
              if (other !== video) other.pause();
            }
            void video.play().catch(() => undefined);
          }
        } else if (!video.paused) {
          if (modeRef.current === "playing") autoPaused.current = true;
          video.pause();
          if (modeRef.current === "playing") setMode("paused");
        }
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(frame);

    return () => {
      observer.disconnect();
      disarmUnmute.current?.();
      window.clearTimeout(idleTimer.current);
    };
  }, [startFilm]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (mode === "preview" || mode === "ended") {
      startFilm(0);
    } else if (video.paused) {
      void video.play();
      setMode("playing");
    } else {
      autoPaused.current = false;
      video.pause();
      setMode("paused");
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    disarmUnmute.current?.();
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    const video = videoRef.current as
      | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
      | null;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (frame?.requestFullscreen) {
      void frame.requestFullscreen();
    } else {
      // iPhone Safari only fullscreens the video element itself.
      video?.webkitEnterFullscreen?.();
    }
  };

  /** Controls hide after a moment of stillness while the film plays. */
  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };

  const active = chapterAt(time);
  const inFilm = mode === "playing" || mode === "paused";

  return (
    <div className="film-layout">
      <div className="film-head">{children}</div>

      <div className="film-stage" data-aos="knocka-zoom">
        <div
          ref={frameRef}
          className="film-frame"
          data-mode={mode}
          data-idle={mode === "playing" && idle}
          style={{ "--film-ratio": storyFilm.ratio } as CSSProperties}
          onPointerMove={wake}
          onPointerLeave={() => mode === "playing" && setIdle(true)}
        >
          <video
            ref={videoRef}
            className="film-video"
            src={storyFilm.src}
            poster={storyFilm.poster}
            preload="none"
            playsInline
            muted
            controls={!hydrated}
            aria-label={storyFilm.alt}
            onClick={hydrated ? togglePlay : undefined}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => {
              const seconds = event.currentTarget.duration;
              if (Number.isFinite(seconds)) setDuration(seconds);
            }}
            onPlay={() => modeRef.current === "paused" && setMode("playing")}
            onPause={(event) =>
              modeRef.current === "playing" &&
              !event.currentTarget.ended &&
              setMode("paused")
            }
            onEnded={() => modeRef.current === "playing" && setMode("ended")}
          />

          {hydrated && mode === "preview" && (
            <button type="button" className="film-play" onClick={() => startFilm(0)}>
              <span className="film-play-icon">
                <PlayIcon />
              </span>
              Watch the film
              <span className="film-play-time">{formatTime(duration)}</span>
            </button>
          )}

          {hydrated && inFilm && (
            <div className="film-controls">
              <button
                type="button"
                className="film-ctrl"
                onClick={togglePlay}
                aria-label={mode === "playing" ? "Pause" : "Play"}
              >
                {mode === "playing" ? <PauseIcon /> : <PlayIcon />}
              </button>
              <span className="film-time">
                {formatTime(time)} / {formatTime(duration)}
              </span>
              <span className="film-spacer" />
              <button
                type="button"
                className="film-ctrl"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <SoundIcon muted={muted} />
              </button>
              <button
                type="button"
                className="film-ctrl"
                onClick={toggleFullscreen}
                aria-label="Full screen"
              >
                <FullscreenIcon />
              </button>
            </div>
          )}

          {hydrated && inFilm && (
            <span
              className="film-progress"
              aria-hidden="true"
              style={{ transform: `scaleX(${clamp01(time / duration)})` }}
            />
          )}

          {hydrated && mode === "ended" && (
            <div className="film-end">
              <p className="film-end-line">
                Don&apos;t text. <span className="text-gradient">Arrive.</span>
              </p>
              <div className="film-end-actions">
                <Button variant="primary" arrow onClick={() => scrollToTarget("#newsletter")}>
                  Join the waitlist
                </Button>
                <Button variant="ghost" onClick={() => startFilm(0)}>
                  Watch again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ol className="film-chapters" aria-label="Chapters">
        {CHAPTERS.map((chapter, index) => {
          const end = CHAPTERS[index + 1]?.start ?? duration;
          const progress = clamp01((time - chapter.start) / (end - chapter.start));
          return (
            // The reveal lives on the <li>, whose class never changes: AOS
            // adds its classes to the element, and a re-rendered className
            // would wipe them. State goes on the button as aria-current.
            <li key={chapter.title} data-aos="knocka-rise" className={CHAPTER_DELAY[index]}>
              <button
                type="button"
                className="film-chapter"
                aria-current={index === active ? "step" : undefined}
                aria-label={`Play from ${formatTime(chapter.start)}: ${chapter.title}. ${chapter.line}`}
                onClick={() => startFilm(chapter.start)}
              >
                <span className="film-chapter-n">{String(index + 1).padStart(2, "0")}</span>
                <span className="film-chapter-title">{chapter.title}</span>
                <span className="film-chapter-time">{formatTime(chapter.start)}</span>
                <span className="film-chapter-line">{chapter.line}</span>
                <span className="film-chapter-bar" aria-hidden="true">
                  <span style={{ transform: `scaleX(${progress})` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
