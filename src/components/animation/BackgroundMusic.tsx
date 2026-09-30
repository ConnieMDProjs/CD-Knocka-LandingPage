"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/music.mp3";
const VOLUME = 0.35;
// touchend and click count as user activation; touchstart alone does not.
// Scroll and wheel are tried too: browsers ignore them as permission, but on
// a site they already trust (or a browser set to allow audio) they succeed.
const GESTURES = ["pointerdown", "click", "keydown", "touchend", "wheel", "scroll"] as const;

/**
 * One looping track for the whole page, paused while the Knocka film section
 * is on screen (the film has its own soundtrack) and resumed after.
 *
 * Browsers refuse audio before a click, tap or key, so playback begins on the
 * visitor's first interaction. A small toggle lets them switch it off.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const started = useRef(false);
  const inFilm = useRef(false);
  const [off, setOff] = useState(false);
  const offRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;

    const disarm = () => {
      for (const type of GESTURES) window.removeEventListener(type, begin);
    };

    const sync = () => {
      if (!started.current) return;
      if (inFilm.current || offRef.current) audio.pause();
      else
        // If the browser still refuses, the listeners stay armed and the
        // next gesture tries again.
        void audio.play().then(disarm, () => undefined);
    };

    function begin() {
      started.current = true;
      sync();
    }
    for (const type of GESTURES) window.addEventListener(type, begin, { passive: true });
    // Try straight away too, in case the browser allows it.
    begin();

    const film = document.getElementById("film");
    const observer = film
      ? new IntersectionObserver(
          ([entry]) => {
            inFilm.current = entry.isIntersecting;
            sync();
          },
          { threshold: 0.05 },
        )
      : null;
    if (film) observer?.observe(film);

    const onToggle = () => sync();
    window.addEventListener("knocka-music-toggle", onToggle);

    return () => {
      for (const type of GESTURES) window.removeEventListener(type, begin);
      window.removeEventListener("knocka-music-toggle", onToggle);
      observer?.disconnect();
      audio.pause();
    };
  }, []);

  const toggle = () => {
    offRef.current = !offRef.current;
    started.current = true;
    setOff(offRef.current);
    window.dispatchEvent(new Event("knocka-music-toggle"));
  };

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={off ? "Turn background music on" : "Turn background music off"}
        aria-pressed={!off}
        className="fixed bottom-4 left-4 z-50 grid size-10 place-items-center rounded-full border border-white/15 bg-[rgba(10,8,16,0.72)] text-white transition-colors hover:border-purple-300/50"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
          {off && <path d="M3 3l18 18" />}
        </svg>
      </button>
    </>
  );
}
