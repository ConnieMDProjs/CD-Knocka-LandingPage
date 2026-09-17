import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import { Aos } from "@/components/animation/Aos";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

/**
 * Outfit carries the display voice: geometric, rounded and youthful, so it
 * sits naturally next to the Knocka wordmark at poster sizes. Inter stays on
 * body copy, which is the stack the project already declared.
 */
const display = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const NOSCRIPT_REVEAL = [
  ".text-reveal-inner",
  ".hero-eyebrow",
  ".hero-lead",
  ".hero-cta-row",
  ".hero-scroll-cue",
  ".knock-portal-art",
  ".site-header",
].join(",") + "{opacity:1!important;transform:none!important}";

// The footer and the invite banner are not listed: their reveals are AOS,
// whose hidden state is gated on the .aos-init class AOS itself adds. No
// script, no class, no hidden content — see styles/aos.css.

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior is required in Next 16 for the framework to
    // keep honouring `scroll-behavior: smooth` across navigations.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
    >
      <body>
        {/* The entrance animations render their initial (hidden) state on
            the server, so without JS the hero would never be revealed. */}
        <noscript>
          <style>{NOSCRIPT_REVEAL}</style>
        </noscript>
        {children}
        <SmoothScroll />
        <Aos />
      </body>
    </html>
  );
}
