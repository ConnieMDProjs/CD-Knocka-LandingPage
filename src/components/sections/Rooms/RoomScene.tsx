"use client";

import { useEffect, useRef } from "react";

import type { Room } from "@/lib/site-config";

export interface RoomSceneProps {
  room: Room;
  /** True while this world should be decoding frames. */
  isPlaying: boolean;
  /** True once the section is close enough to be worth downloading. */
  isArmed: boolean;
  /**
   * True once this world is worth its own bytes in full. The first world is
   * needed the moment the section is reached; the other two would otherwise
   * put all three videos on the wire in the same instant.
   */
  isEager: boolean;
}

/**
 * One room in the strip.
 *
 * The depth-stack transforms this used to carry are gone — the three rooms no
 * longer crossfade in place, they sit side by side and the strip itself
 * moves. What is kept, unchanged, is the playback and loading architecture:
 * the `src` is withheld until the section is near, the first room preloads in
 * full while the other two hold at metadata, and a room only decodes while
 * the section says it should.
 */
export function RoomScene({ room, isPlaying, isArmed, isEager }: RoomSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isArmed) return;

    if (isPlaying) {
      // Muted + playsInline is the combination browsers allow to autoplay.
      // If a policy still refuses, the frame stays on its poster frame.
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isPlaying, isArmed]);

  return (
    <video
      ref={videoRef}
      className="room-scene-video"
      // src is withheld until the section is near, so the page does not
      // pay for three videos on first load.
      src={isArmed ? room.video : undefined}
      // Staged rather than uniform: arming the section used to request all
      // three videos in the same instant. The first room still fetches in
      // full ahead of time; the other two hold at metadata until the visitor
      // is actually in the section, which leaves them a whole panel of
      // scrolling to finish — far more than they need.
      preload={isArmed ? (isEager ? "auto" : "metadata") : "none"}
      muted
      loop
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
