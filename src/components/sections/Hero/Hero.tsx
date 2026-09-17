"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { TextReveal } from "@/components/animation/TextReveal";
import { Button } from "@/components/ui/Button";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });

  // Foreground drifts further than the copy, which reads as depth against
  // the DNA field behind both.
  const portalY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -34]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" ref={stageRef}>
        <motion.div className="hero-copy" style={reduceMotion ? undefined : { y: copyY }}>
          <motion.p
            className="hero-eyebrow"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.12 }}
          >
            <span aria-hidden="true">✦</span> Messaging, but alive
          </motion.p>

          <h1 className="hero-title" id="hero-title">
            <TextReveal className="hero-title-line" delay={0.2}>
              Feel the
            </TextReveal>
            <TextReveal className="hero-title-line" delay={0.32}>
              <span className="text-gradient">Message.</span>
            </TextReveal>
          </h1>

          <motion.p
            className="hero-lead"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.62 }}
          >
            <strong>Don&apos;t text. Arrive.</strong> Knocka is messaging where
            your avatar shows up — with your face, your voice and your
            reactions.
          </motion.p>

          <motion.div
            className="hero-cta-row"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.74 }}
          >
            <Button variant="primary" size="lg">
              Join the Waitlist →
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-portal-slot"
          style={reduceMotion ? undefined : { y: portalY }}
        >
          {/* <KnockPortal /> */}
        </motion.div>

        <motion.div
          className="hero-scroll-cue"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 1.1 }}
        >
          <span className="hero-scroll-line" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
