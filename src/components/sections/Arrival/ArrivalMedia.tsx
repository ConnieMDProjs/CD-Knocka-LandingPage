"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

import { arrivalMedia } from "@/lib/site-config";

export interface ArrivalMediaProps {
  /** True once the section is close enough to be worth downloading. */
  isArmed: boolean;
  /** True once scroll has reached the arrival beat and the frame is open. */
  isPlaying: boolean;
  /**
   * True when the section is rendering as a static composition. Reduced
   * motion holds on the first frame instead of playing a knock at someone.
   */
  allowManualPlay?: boolean;
  /**
   * Fired the moment the arrival actually begins — the video's first frame,
   * not the scroll threshold that asked for it. The two knock marks are timed
   * from here, so they land on the video's real hits even if it took a moment
   * to start.
   */
  onPlaybackStart?: () => void;
}

/**
 * Whatever arrives in S2's frame.
 *
 * The section is built around a media *slot*, not a particular asset: the
 * frame's ratio, the beats and the knock timing all resolve from
 * `arrivalMedia`. It currently names the welcome video, which the client
 * asked for here, with sound.
 *
 * ## Sound
 *
 * It plays with sound automatically, with no control to press. **A browser
 * will not autoplay audio without a prior user gesture, and scrolling is not
 * a gesture** — Chrome, Safari and Firefox all require a click, a tap or a
 * key first. So this asks for sound, and when the browser refuses it plays
 * muted and unmutes itself on the visitor's very next interaction anywhere on
 * the page. Nothing is ever asked of them, and anyone who has already clicked
 * something — the header CTA, a nav link — hears it on the first try.
 *
 * The `src` is withheld until the section is near, so the page never pays for
 * the download on first load, and it does not loop: an arrival that repeats
 * is not an arrival.
 */
export function ArrivalMedia({
  isArmed,
  isPlaying,
  allowManualPlay = false,
  onPlaybackStart,
}: ArrivalMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = arrivalMedia.kind === "video";

  /** Reports the real start of playback exactly once per arrival. */
  const started = useRef(false);
  const announce = useCallback(() => {
    if (started.current) return;
    started.current = true;
    onPlaybackStart?.();
  }, [onPlaybackStart]);

  useEffect(() => {
    if (isVideo) return;
    // A still image has nothing to start, so the beat is the threshold.
    if (isPlaying) announce();
    else started.current = false;
  }, [isVideo, isPlaying, announce]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isArmed) return;

    // Reduced motion: hold on the first frame.
    if (allowManualPlay) return;

    if (!isPlaying) {
      video.pause();
      // Rewound so scrolling back up and down replays the arrival rather
      // than resuming it half-finished.
      video.currentTime = 0;
      started.current = false;
      return;
    }

    let cancelled = false;
    let waiting: (() => void) | undefined;

    /*
      The rescue path. Autoplay was refused sound, so the clip is running
      muted; the first real gesture the visitor makes anywhere on the page
      banks the activation this needed, and the sound simply comes on. If the
      clip has already finished by then it starts over, because the knock is
      the point of it.
    */
    const unmuteOnGesture = () => {
      const events = ["pointerdown", "keydown", "touchstart"] as const;
      const run = () => {
        stop();
        if (cancelled || video.muted === false) return;
        video.muted = false;
        video.volume = 1;
        if (video.ended || video.paused) {
          video.currentTime = 0;
          started.current = false;
          void video.play().catch(() => undefined);
        }
      };
      const stop = () => {
        for (const type of events) {
          window.removeEventListener(type, run);
        }
      };
      for (const type of events) {
        window.addEventListener(type, run, { once: true, passive: true });
      }
      waiting = stop;
    };

    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;

    void video
      .play()
      .then(() => {
        // Some browsers honour play() but mute it rather than refusing.
        if (!cancelled && video.muted) unmuteOnGesture();
      })
      .catch(() => {
        if (cancelled) return;
        video.muted = true;
        void video.play().catch(() => undefined);
        unmuteOnGesture();
      });

    return () => {
      cancelled = true;
      waiting?.();
    };
  }, [isArmed, isPlaying, allowManualPlay]);

  if (arrivalMedia.kind === "video") {
    return (
      <video
        ref={videoRef}
        className="arrival-media-el"
        src={isArmed ? arrivalMedia.src : undefined}
        poster={arrivalMedia.poster}
        preload={isArmed ? "auto" : "none"}
        playsInline
        aria-label={arrivalMedia.alt}
        tabIndex={-1}
        onPlaying={announce}
      />
    );
  }

  return (
    <Image
      className="arrival-media-el"
      src={arrivalMedia.src}
      alt={arrivalMedia.alt}
      // Intrinsic size of the asset. Display size comes from CSS.
      width={arrivalMedia.width}
      height={arrivalMedia.height}
      sizes="(max-width: 560px) 90vw, (max-width: 900px) 70vw, 620px"
    />
  );
}
