"use client";

import { useEffect, useRef } from "react";

/**
 * Rotating DNA strand of particles painted on a fixed, full-viewport
 * canvas. The strand phase and the particles' vertical drift are both
 * driven by window scroll, so the helix twists as the page moves.
 *
 * The render loop is intentionally unchanged from the original
 * implementation: same particle count, same maths, same 2D fast path
 * (flat fills, no shadow blur) that keeps it smooth on low-end devices.
 */

interface Particle {
  /** Seed position along the strand, before scroll and time offsets. */
  yPos: number;
  /** 0 or PI: which of the two helix strands the particle belongs to. */
  strandOffset: number;
  size: number;
  scatterX: number;
  scatterY: number;
  /** Deterministic seed picking one of the three accent colours. */
  colorType: number;
}

/** Optimized light count (500 particles) for zero lag. */
const PARTICLE_COUNT = 500;
const BACKGROUND_COLOR = "#030305";
const COLOR_CYAN = "#38bdf8";
const COLOR_VIOLET = "#c084fc";
const COLOR_MAGENTA = "#ec4899";

const STRAND_CENTER_RATIO = 0.72;
const STRAND_FREQUENCY = 1.4;
const STRAND_AMPLITUDE = 180;
const TIME_STEP = 0.008;
const DRIFT_SPEED = 45;
const SCROLL_DRIFT = 0.4;
const SCROLL_TWIST = 3;
const PARTICLE_ALPHA = 0.8;

const createParticles = (): Particle[] =>
  Array.from({ length: PARTICLE_COUNT }, () => ({
    yPos: Math.random() * 2000,
    strandOffset: Math.random() > 0.5 ? 0 : Math.PI,
    size: Math.random() * 1.4 + 0.6,
    scatterX: (Math.random() - 0.5) * 30,
    scatterY: (Math.random() - 0.5) * 30,
    colorType: Math.random(),
  }));

export function DNAAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles = createParticles();

    let time = 0;

    const render = () => {
      time += TIME_STEP;
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, width, height);

      const scrollY = window.scrollY;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollProgress = scrollY / maxScroll;

      const cx = width * STRAND_CENTER_RATIO;

      particles.forEach((p) => {
        const screenY =
          (p.yPos - scrollY * SCROLL_DRIFT + time * DRIFT_SPEED) % height;
        const normalizedY = screenY < 0 ? screenY + height : screenY;

        const progress = normalizedY / height;
        const phase =
          progress * Math.PI * STRAND_FREQUENCY +
          time * 2 +
          p.strandOffset +
          scrollProgress * Math.PI * SCROLL_TWIST;

        const x = cx + Math.sin(phase) * STRAND_AMPLITUDE + p.scatterX;
        const y = normalizedY + p.scatterY;

        // Fast color assignment without heavy shadow filters
        if (p.colorType > 0.65) {
          ctx.fillStyle = COLOR_CYAN;
        } else if (p.colorType > 0.3) {
          ctx.fillStyle = COLOR_VIOLET;
        } else {
          ctx.fillStyle = COLOR_MAGENTA;
        }

        ctx.globalAlpha = PARTICLE_ALPHA;

        // Simple fast circle rendering
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Sized in viewport units on purpose: base.css deliberately excludes canvas
  // from the img/video max-width rule so the scrollbar gutter cannot shrink it.
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 z-0 h-screen w-screen"
      aria-hidden="true"
    />
  );
}
