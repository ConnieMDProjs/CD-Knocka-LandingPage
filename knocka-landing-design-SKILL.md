---
name: knocka-landing-design
description: Build a distinctive, premium, highly responsive Knocka marketing landing page with creative scroll storytelling, avatar-driven interactions, and production-grade Motion/Framer Motion animation.
---

# Knocka Landing Design Skill

## Mission
Create a landing page that feels like Knocka itself, not a generic SaaS website.

Knocka is social communication through expressive avatars, reactions, movement, voice, presence, and screen knocking. The website must demonstrate that idea through visual storytelling.

**Do not make a normal landing page with animations added afterward. Design the page as a scroll-driven experience.**

## Design Direction
Tone: playful, expressive, social, slightly mischievous, premium, youthful, cinematic.

Prefer:
- near-black foundations
- violet, purple, electric-blue and magenta accents
- controlled gradients and atmospheric glow
- translucent/glass surfaces where useful
- large expressive typography
- 3D avatar imagery/video
- asymmetry, overlap and depth
- subtle grain/noise and restrained particles

Avoid:
- generic SaaS card grids
- white + purple-gradient cliché
- excessive rounded cards
- Inter/Roboto/Arial as display fonts
- random gradients
- excessive neon
- generic dashboards
- stock illustrations
- repetitive fade-up animations

## Hero
The hero is the product demonstration.

Core message:
**You don't just send a message. You show up.**

Use the Knocka avatar video:
1. Avatar appears.
2. Looks at visitor.
3. Exactly two screen knocks.
4. Friendly wave.
5. Knocka brand moment.

Suggested copy:
**Don't just text. Knock.**
Send messages with presence, expression, voice and your avatar.

CTA: **Join the Waitlist →**

## Scroll Story
Use meaningful scroll-linked storytelling rather than identical reveal animations.

Combine:
- scroll-linked transforms
- sticky/pinned scenes
- horizontal storytelling
- parallax depth
- masked/clip-path reveals
- scale choreography
- opacity choreography
- background transitions
- text choreography
- video/image transitions

Aim for 3–5 memorable moments, not hundreds of effects.

## Recommended Sections

### 1. Hero
Dark cinematic opening. Avatar video plays once. Ambient particles are subtle. On scroll, hero content scales down and moves deeper into the page.

### 2. Boring Texting
Show an ordinary monochrome text conversation. Messages appear slowly and repetitively. The scene should communicate how flat ordinary texting feels.

Then reveal:
**What if your message showed up instead?**

Transform the boring conversation into Knocka.

### 3. Avatar Communication
Let the avatar become the visual focus. Surround it with expressive UI/reaction elements. As the user scrolls, boring message elements transform into avatar-based communication.

### 4. Features
Do NOT use a conventional 3-column card grid.

Give each feature a visual scene:
- Show how you feel.
- Say it with your voice.
- Knock when words aren't enough.
- Be there, even when you're not.

Each scene gets short copy, a large visual and one meaningful interaction.

### 5. Social Rooms
Use the provided club, ice-cream-shop and coffee-shop videos.

Start scenes as visual windows. On scroll:
- window expands
- border radius changes
- scene approaches full-screen
- avatars become more visible
- copy appears in negative space
- scene morphs into the next section

Message:
**Your avatar doesn't just send messages. It can show up.**

## Motion for React
Prefer Motion for React when the project already uses React.

Use:
- `useScroll`
- `useTransform`
- `useSpring`
- `useMotionValueEvent`
- `whileInView`
- `AnimatePresence`

Use MotionValues instead of React state for per-frame scroll values.

Example:

```tsx
const { scrollYProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "end start"],
});

const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 1.04]);
```

Use `useSpring` when raw scrolling feels mechanical.

## GSAP
Use GSAP + ScrollTrigger only when complex timelines, pinning, scrubbed sequences or advanced sequencing genuinely justify it.

Do not use GSAP and Motion for the same animation without a clear reason.

## Scroll Patterns

### Parallax
Background moves least, midground moderately, avatar/foreground more. Keep it subtle.

### Sticky storytelling
For major scenes, use roughly 200–400vh sections with sticky visuals and changing text/visual states.

### Horizontal scenes
Use vertical scrolling to drive horizontal movement for avatar collections, rooms or communication modes when it adds narrative value.

### Masked reveals
Use clip-path/masks for avatar entrances, video reveals and transitions.

### Scale
Prefer subtle ranges such as `0.92 → 1 → 1.04`, not aggressive zooming.

## Performance
Prioritize transform and opacity. Be cautious with layout properties and expensive filters.

Use:
- lazy-loaded images
- compressed WebM/MP4
- poster images
- responsive image sizes
- `will-change` only when justified
- reduced-motion support

Respect:
```css
@media (prefers-reduced-motion: reduce)
```

Mobile must remain smooth.

## Responsive Design
Do not simply shrink desktop.

Desktop:
- asymmetric compositions
- large avatar visuals
- pinned storytelling
- layered depth

Mobile:
- fewer simultaneous animations
- shorter pinned sections
- less parallax
- reduced particles
- vertical storytelling when horizontal scenes become awkward

Never allow horizontal overflow or clipped CTAs.

## Typography
Use a distinctive display typeface for major headlines and a restrained readable body face. Typography should feel bold, youthful and expressive.

## Color
Base: near-black / deep charcoal.
Accents: violet, purple, electric blue.
Secondary: magenta, soft cyan.

Use strong color only for important moments. Do not turn everything into a gradient.

## Micro-interactions
Use sparingly:
- avatar eye movement toward cursor
- subtle avatar tilt
- magnetic CTA
- knock-inspired button press
- avatar reaction on CTA hover
- subtle logo movement

Every interaction should reinforce Knocka's personality.

## Creative Rule
For every major animation ask:

**Why does this belong to Knocka?**

Good answers involve presence, expression, emotion, communication, personality or social interaction. If it only looks cool, remove it.

## Final Quality Gate
Before finishing:
- It must look like Knocka, not generic SaaS.
- Avatar storytelling must be central.
- Scrolling must reveal meaningful changes.
- There must be 3–5 memorable moments.
- Boring texting must contrast clearly with Knocka.
- Motion must have purpose.
- The first screen must communicate the concept immediately.
- Mobile must be excellent.
- No repetitive fade-up animation everywhere.
- No unnecessary card grids.
- No horizontal overflow.
- Test desktop, tablet and mobile.
- Test video loading and reduced-motion behavior.
- Verify all CTAs and section transitions.
- Remove unused animation code and unnecessary dependencies.

The final result should feel like a **high-end interactive product launch**, not an AI-generated template.
