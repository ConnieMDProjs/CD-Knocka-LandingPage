# Knocka Landing Page — Agent Notes

Running record of design decisions for the Knocka marketing site. Read this
before changing the header or hero; append a section per phase.

**This file is HOW and RULES.** For WHAT and WHY — positioning, the page story,
section specs, the asset map and the phased implementation plan — read
[LANDING_PAGE_STRATEGY.md](./LANDING_PAGE_STRATEGY.md) first.

---

## Phase 1 — Foundation

Structure moved to `src/` (`app`, `components`, `lib`, `styles`), Tailwind v4
fixed (the stylesheet was using v3 `@tailwind` directives, so no Tailwind was
being emitted at all), design tokens extracted, the DNA canvas isolated into
`components/animation/DNAAnimation`, and responsive breakage fixed. No visual
redesign. Styles for sections that have no markup yet are preserved verbatim in
`src/styles/sections.css`.

---

## Phase 2A — Header + Hero

### Header

A **floating glass control layer**, not a docked navbar: fixed, inset from all
edges, `1fr auto 1fr` grid so the nav stays optically centred no matter how wide
the logo or actions get. Translucent surface + `backdrop-filter`, hairline
border, inner top highlight, deep shadow.

- **Logo** is the real `public/branding/knocka-logo.svg` asset (wordmark with the
  gradient K and chat-bubble "a"), 32px tall. Not recreated in text.
- **Scroll state**: past 24px the bar densifies — more opaque, tighter padding,
  a purple glow joins the shadow. Toggled by a boolean off `useScroll`, so it is
  one class change, not a per-frame style write.
- **Hover**: a single pill slides between nav links via a shared `layoutId`, so
  the nav reads as one instrument rather than four independent buttons.
- **Mobile**: collapses progressively — nav into the menu at 1024px, the ghost
  CTA at 760px, the primary CTA at 360px. The menu is a glass panel that drops
  from the bar with both CTAs; the toggle's two bars fold into a cross, echoing
  the knock marks in the avatar artwork. Escape closes it.

### Hero composition

Art-directed **stage**, not a two-column grid. Copy and portal share a single
grid cell (`grid-template-areas: "stack"`) so they can overlap, with
`align-items: center` lining the portal up with the middle of the **copy block**
rather than the middle of the stage. Stacking in a cell rather than positioning
absolutely keeps the parallax translate free for Framer Motion to write.

The portal sits on the DNA strand (the canvas paints its helix at ~72% of
viewport width) so the particles read as the energy the knock releases.

The portal column (42%) is narrower than the copy column (62%) reaches, which
is what opens the gap between the headline and the artwork — a measured 35–49px
of clear space from 901px up. Earlier revisions ran the headline *behind* the
portal; that was pulled back in favour of the gap. If the interleave is ever
wanted again, widen the portal or raise the headline's `clamp()` cap and
re-measure, because those two values are what set the relationship.

### Right-side visual — "the knock"

`public/branding/knocka-avatar-logo.png`: the Knocka character knocking through
a message frame. Chosen over an invented object because the asset *is* the brand
metaphor — "don't text, arrive" is literally what the artwork shows. No video,
no card, no mockup.

Two things make it a composition rather than a pasted image:

1. **The artwork is cut out**, so the DNA particles read straight through the
   hollow message frame and around the character. This is the main hero↔DNA
   integration and it is why the frame reads as a portal rather than a card.
   (The asset was swapped to a background-removed version mid-build — 615x512.
   An earlier version shipped on an opaque black plate and needed a radial mask
   to fake this; that mask is gone. If the asset is ever replaced with a
   plated one again, the mask has to come back.)
2. **Two static glow layers** sit behind it: a wide radial bloom that tints the
   DNA in that region, and a blurred rounded-rect *ring* that hugs the frame.
   The ring is a border, not a fill — a filled glow washes out the particles
   visible through the hollow frame.

The artwork keeps a slow 7s float and its entrance; it has no other motion.
An earlier revision had knock ripples leaving the knuckles, replayed on CTA
hover — **removed on request**, along with the "hover to knock" label and the
throttled state that drove it.

### Typography

- **Display: Outfit** (`next/font/google`), geometric and rounded, chosen to
  harmonise with the Knocka wordmark's own geometry. Weight 900, uppercase,
  `line-height: .88`, `letter-spacing: -.045em`.
- **Body: Inter**, the stack the project already declared but never actually
  loaded — it was silently falling back to Arial.
- Both wired through the existing `--font-display` / `--font-sans` tokens.
- Headline scale `clamp(42px, 11vw, 148px)`. The cap, the copy column width and
  the portal width together set the gap beside the artwork, so re-measure if you
  touch any of them.
- Mobile deliberately tops out around 43–47px. Big, not shouty.

### Animation

Framer Motion (already a dependency). Everything is transform/opacity.

- Header slides down on load; hover pill is a shared-layout animation.
- Headline uses a **masked line reveal** (`components/animation/TextReveal`) —
  lines rise out of their own overflow box. No fades on the headline.
- Eyebrow → headline → lead → CTA stagger between 0.12s and 0.74s.
- Portal scales up from 0.92 with a long ease, then floats on a 7s cycle.
- Parallax on scroll: portal drifts -90px, copy -34px, which separates them in
  depth against the DNA field.
- `prefers-reduced-motion` is honoured throughout: rings are not rendered, the
  float and parallax are dropped, reveals become short opacity fades.

### Responsive

- **≥901px**: copy and portal stacked in one centred grid cell. Copy column 62%
  (64% at 1440+), portal 42% pinned right.
- Page gutter is `clamp(24px, 3vw, 40px)` — a global token, so the header bar,
  the hero stage and every future section inset together.
- **≤900px**: single flow, but recomposed rather than stacked — the portal is
  cropped off the right edge and the copy rides *up* over its faded lower edge,
  so the layering survives. Verified at 320/360/375/390/430/600/768/820/900.
- No horizontal overflow at any width from 320px to 1920px. The portal's bleed
  is intentional and contained by `.knocka-page { overflow-x: clip }`.

---

## Phase 2B — Footer

### Composition

One glass panel, echoing the header's control-layer language, built on the
device all three reference footers share: an **oversized wordmark cropped by
the panel edge**, acting as the floor of the site.

Inside the panel: brand block + app download on the left, four link columns on
the right, a hairline divider, a meta row, then the wordmark.

### The wordmark

Set in the display face at title case (the hero already carries uppercase, and
title case matches the logo).

**Fill, revised on request (post-Phase 3).** It was a lilac-to-cyan vertical
gradient that dissolved into the DNA field. It is now two clipped layers: a
purple that is lit at the cap line and sinks to near-black by the baseline, and
a symmetric darkening at the left and right extremes, so the middle letters are
bright and the outer ones fall into shadow.

**Place gradient stops against the ink, not the box.** `background-clip: text`
paints across the span's whole line box, but the glyphs only occupy about
**12% (cap line) to 82% (baseline)** of it — the rest is leading, and the crop
throws the bottom of the box away entirely. Stops written 0-100% put their
darkest end in the part that gets cut off, so the shadow does not read at all.
Measure the ink band before touching these numbers.

**The wordmark is cut by the floor, not resting on it.** `margin-bottom:
-0.22em` runs the letterforms past the panel's inner edge; `margin-top: -0.1em`
removes the font's half-leading, which was opening dead space above the caps.
Measured flush at 320-1920 (the only gap is the panel's own 1px border), with
the crop scaling proportionally from 14px to 77px. No filters: the shadow is
gradient, so the entrance animation stays cheap - 59.9fps with the footer
filling the viewport.

**Sized in `cqw`, not `vw`.** The panel stops growing at `--stage-max` while
the viewport does not, so a vw-based size drifted from 89% to 104% of the
panel width — cropping the outer letters at wide viewports. `container-type:
inline-size` on the panel plus `31cqw` holds it at a steady 85–96% everywhere.
The bottom crop is an em-based negative margin, so the same slice is cut at
every size.

### App download

App Store and Google Play badges, marks drawn as inline SVG so they cost no
network weight. Glass pills with the same tactile press as the site buttons.
Links are `href="#"` — visual only, as requested.

### Performance

The panel is translucent but has **no `backdrop-filter`**. The DNA canvas
repaints behind it continuously, so blurring a panel this large would re-blur
the backdrop every frame — the same class of trap as the drop-shadow noted
above. Plain alpha lets the particles read through at zero cost: measured 60fps
with the footer filling the viewport.

### Notes

- `--page-min-height: 220vh` is **retired**. It was a placeholder giving the DNA
  scroll reaction room while the hero stood alone; the footer now supplies real
  height, and `.knocka-page` is back to `min-height: 100vh`.
- Namespaced `.site-footer*` because `sections.css` still reserves `.footer`,
  `.footer-brand` and `.footer-column` for a later design.
- Link labels outside the Explore column (Company, Legal, Social) are
  **placeholders** in `site-config.ts` — real destinations still needed.
- "Back to top" is real behaviour and respects reduced motion (it passes
  `behavior: "auto"` rather than relying on the CSS media query, which
  programmatic scrolls ignore).

### Files added

- `src/components/sections/Footer/Footer.tsx`, `StoreBadges.tsx`, `index.ts`
- `src/styles/footer.css`
- `src/lib/site-config.ts` — `footerGroups`, `socialGroup`
---

## Phase 2C — Rooms

### Chosen interaction: depth arrival

Three concepts were weighed: a vertical world-reel with counter-parallax, a
portal that widens from message-frame to cinemascope, and a depth stack.

**Depth stack won.** The three worlds are layered in Z inside one pinned
cinematic frame; scroll flies the camera forward, so the world you leave comes
toward you and passes the lens while the next scales up from behind. It is the
only one of the three that says *arrival* — which is the brand — and it is pure
transform/opacity, so it cannot threaten the DNA canvas budget. The widening
portal was rejected because it needs animated clip-path/layout on a large video
layer every frame, and it would crop the cinematography differently per room.

Outgoing worlds paint **above** incoming ones (`zIndex: total - index`), which
is what makes it read as flying through rather than cross-dissolving.

### Scroll architecture

`.rooms-runway` (340vh, 300vh under 900px) holds a `position: sticky` stage.
`useScroll({ target: runwayRef, offset: ["start start", "end end"] })` maps the
pinned distance to 0→1. Each `RoomScene` derives its own transforms from that
single value.

**Two traps worth knowing, both cost real debugging time:**

1. **Transform input ranges must stay inside `[0, 1]`.** Framer Motion v13 hands
   scroll-linked chains to the browser as native WAAPI animations, where the
   input range becomes keyframe *offsets*. A stop at `-0.1` threw
   `Offsets must be monotonically non-decreasing` at mount and blanked the whole
   page. The outer worlds now get three stops instead of four.
2. **That acceleration is desynced from `useScroll` offsets.** Once accelerated,
   framer stops writing the JS value and the native ViewTimeline drives it — but
   it reported 52.8% progress at the end of the runway, so the first world faded
   back in over the last. Acceleration only attaches when a transform maps an
   array range straight off the scroll value, so `Rooms.tsx` routes progress
   through one identity function transform to detach it. **Keep that
   indirection**; removing it silently reintroduces the bug.

### Video behaviour

All three are 1536x672 (2.29:1 cinemascope), 8s, muted + `playsInline` + `loop`.

- `src` is withheld until `useInView` says the section is within 80% of the
  viewport, so the page never pays 6.3MB on first load.
- Playback is gated by a bitmask off scroll position. Only the active world
  decodes; the next warms at 72% through the previous band.
- The outgoing world **freezes** once the label swaps rather than playing
  through its fade. Two videos decoding at once halves the canvas frame rate,
  and by then it is scaling away, so a still frame does not read.
- `aspect-ratio` on the frame matches the source exactly, so there is no layout
  shift and no letterbox.

### Responsive

The frame trades width for height as the screen narrows, so the avatars stay
large instead of the video becoming a slot: 2.29:1 above 900px, 16:9 to 560px,
4:3 below. Checked against the source frames — both avatars survive the 4:3
crop. The width also carries an `svh` term so the frame always fits a short
viewport without breaking ratio. Caption and progress stack under 560px.

### Performance

- No second canvas. The portal floats over the existing fixed DNA canvas, and
  the three glows step purple -> magenta -> cyan, so travelling the rooms walks
  the brand gradient. That is the whole DNA tie-in.
- Glows crossfade by class with a CSS transition, not a per-frame style write.
- A scrim div carries the depth dimming instead of a `brightness()` filter — no
  filters on moving layers, per the drop-shadow lesson above.
- Canvas holds **60fps** while a world is pinned. It dips to **~33fps** during a
  crossfade, when two videos decode. Measured in headless Chrome with
  `--disable-gpu`, so that is software decode and a worst case; the overlap is
  already as short as the crossfade allows. Worth re-measuring on real hardware
  before optimising further.

### Validation

`tsc` clean, `eslint` clean, production build clean. No horizontal overflow at
320/375/390/768/1024/1280/1440/1920. Sticky confirmed working under
`.knocka-page { overflow-x: clip }`. Reduced motion drops scale, drift and the
scrim and leaves a plain opacity crossfade. DNA rotation and scroll reaction
unchanged; header, hero and footer untouched.

### Files added

- `src/components/sections/Rooms/Rooms.tsx`, `RoomScene.tsx`, `RoomProgress.tsx`, `index.ts`
- `src/styles/rooms.css`
- `src/lib/site-config.ts` — `rooms`

### Note

Lenis is installed but still unused. Enabling it would smooth every scroll-driven
section, but it changes the feel of the header, hero parallax and DNA reaction
too, so it was left alone here — it should be its own decision.
### Files changed

- `src/app/layout.tsx` — fonts, noscript reveal safeguard
- `src/components/navigation/SiteHeader.tsx`
- `src/components/sections/Hero/Hero.tsx`, `KnockPortal.tsx`
- `src/components/animation/TextReveal/` (new)
- `src/components/ui/Button.tsx` — now a client motion component with a press
- `src/lib/site-config.ts` — nav label "Flow & Motivi"
- `src/styles/site-header.css`, `hero.css`, `tokens.css`, `utilities.css`
- `public/branding/knocka-logo.svg` — see below

### Future considerations

- **The logo SVG was 1.8 MB.** It embedded a 1024×1024 PNG for a glyph that
  renders at ~30px. Downsampled to 192px: **1.8 MB → 55 KB**, visually identical.
  The original is kept at `knocka-logo.original.svg`. If the logo is ever
  re-exported, check for the same problem.
- **Nav has no active state yet** because there are no sections to be active in.
  When the sections land, drive it from a scroll-spy and reuse the existing
  `layoutId` pill.
- **`--page-min-height: 220vh`** is still a placeholder that gives the DNA scroll
  reaction room. Remove it once real sections provide the height.
- The old hero's CSS (`.hero-video`, `.avatar-bubble`, `.eyebrow`) was replaced,
  not preserved — that markup no longer exists. `sections.css` is untouched.
- **Never put `filter: drop-shadow()` on the portal artwork.** It follows the
  image's alpha silhouette, so the float animation forces a re-rasterisation
  every frame. Measured: the DNA canvas fell from 60fps to **11fps**, and
  removing that one declaration restored it. The static glow layers behind the
  artwork do the same job for free because they never move. The same trap
  applies to any animated element carrying a blur/shadow filter.
- Canvas frame rate is the cheapest regression signal on this page. If the hero
  ever feels heavy, measure the DNA loop's fps before anything else.
- The DNA canvas still ignores `devicePixelRatio` (soft on retina). Changing it
  costs fill rate; left alone deliberately.

---

## Phase 0 — Product and content decisions

Ran after Phase 2C despite the number; it is Phase 0 of the plan in
[LANDING_PAGE_STRATEGY.md](./LANDING_PAGE_STRATEGY.md). Content and navigation
only — no new sections, no visual redesign.

### The nav conflict, and how it was resolved

Phase 0 required every active nav item to point at a real element, but every
nav *label* is still an open client question. Renaming them would have been
guessing; leaving them would have shipped four dead links (all four, once Rooms
took `#rooms`).

Resolution: **`navLinks` keeps the full intended navigation, and a `ready` flag
decides what renders.** No label was renamed or deleted; unready entries are
simply not painted. `activeNavLinks` is what the header and the footer Explore
column consume.

This makes each later phase a one-line change: build the section, flip its flag.

| Label | Anchor | ready | Unblocked by |
|---|---|---|---|
| Flow & Motivi *(label unresolved)* | `#arrival` | false | Phase 1 |
| Features | `#range` | false | Phase 2 |
| **Rooms** | `#rooms` | **true** | — |
| Modes | `#modes` | false | Phase 4 |
| FAQ *(existence unresolved)* | `#faq` | false | Client |

Anchors were pre-wired to the strategy's targets. Anchors are implementation
detail, not client-facing copy, so changing them decides nothing.

### Also changed

- **Rooms `id="modes"` → `id="rooms"`.** The only item the strategy marked
  *Decided*. `#modes` now belongs to S5 and intentionally resolves to nothing
  until Phase 4.
- **Hero lead, second sentence only.** Was four abstract nouns ("emotion, voice,
  movement and presence"); now names the category. Headline, artwork, layout,
  type scale, animation and CTA untouched. Verified 2 lines at desktop before
  and after — no reflow.

### Deliberately NOT changed

- **"Glass Matrix"** — still in the header and mobile menu. Strategy marks it
  *Client confirmation*; it is meaningless but not misleading, so the smallest
  safe change was none.
- **App Store / Google Play badges** — still read "Download on the / App Store".
  Whether the product is pre-launch is open question 2. Guessing either way
  risks shipping a false claim, so the visual implementation is untouched.

### Known cosmetic consequence

The footer Explore column now lists a single link. It refills as phases land.
Not worth a footer redesign to hide a temporary state.

### Validation

`npm run lint` clean · `tsc --noEmit` clean · `npm run build` clean. Checked at
320/390/768/1024/1440/1920: one rendered anchor (`#rooms`), zero dead anchors,
zero horizontal overflow. DNA unchanged (500 particles, scroll reaction Δy 430).
Rooms walk identical at all 7 scroll stops. Reduced motion unaffected. No
dependency changes.

---

## Phase 1 — S2 The Flat -> The Arrival

The section spec, the beat table and the video decision live in
[LANDING_PAGE_STRATEGY.md](./LANDING_PAGE_STRATEGY.md). This is only what an
implementer needs to know before touching the files.

### Where the timing lives

`Arrival/score.ts` holds the entire section: every beat as a fraction of the
runway, plus the two knock offsets. Nothing is timed anywhere else. If a beat
needs to move, move it there — the thread, the plate, the spark and the frame
all read from it, and they only read correctly relative to each other.

### The one trick worth understanding

The thread and the arrival frame sit in the **same grid cell**
(`.arrival-core`, `grid-template-areas: "core"`). So the thread's transform
origin and the frame's transform origin are the same point, and the collapse
is one `scale` on the thread wrapper — no measurement, no layout reads, no
per-bubble journey to a computed centre. The bubbles only add a small
horizontal drift so it reads as a squeeze rather than a uniform shrink.

The cell is sized by the frame, not by the thread, which is why nothing
reflows when the frame appears.

### Two scroll ranges, not one

The plate (`.arrival-scrim`) hides the DNA canvas, so it has to be opaque
before the section pins and gone before it ends. It is driven by **two**
`useScroll` calls on the same ref:

- `["start start", "end end"]` — the runway, which drives every beat;
- `["start end", "start start"]` — the approach, which the plate is multiplied by.

**A plate that overhangs upward will cover the hero.** The section is a later
sibling at the same `z-index`, so it paints over it. An earlier revision used
`inset: -70vh 0` to keep the feathered edges off-screen during the pin, and at
page load that put an opaque layer across the hero's lead and CTA — caught by
screenshotting the hero, not by any automated check. The plate now starts
exactly at the stage's top edge and overhangs downward only.

### The two knocks

Scroll **arms** the sequence; `KNOCK_BEATS` **performs** it. A purely
scroll-linked knock would let the visitor's scroll speed set its rhythm, and
the rhythm is the brand. The arm/disarm thresholds are 0.84 / 0.66 —
hysteresis, so a scroll resting on the boundary cannot retrigger every frame.

The frame kick and the edge flash ride one shared impulse track
(`KNOCK_PULSE`), whose two peaks are the same 0.34s apart. Change one number
and both stay in sync.

If the welcome video is ever approved, it knocks twice itself: **retime
`KNOCK_BEATS` to its knock frames.** Do not add a second knock animation.

### The media slot

`arrivalMedia` in `site-config.ts` is a discriminated union, and
`ArrivalMedia.tsx` implements both arms. The frame is authored at the welcome
video's own 4:3, so the swap is the config object and nothing else. The video
path withholds `src` until `useInView` says the section is near, is muted +
`playsInline`, does not loop, and rewinds when it leaves the arrival beat.

### Traps this section re-confirms

- **The identity `useTransform` is mandatory.** Same WAAPI acceleration trap
  as Rooms, same fix, same reason. Every stop in `score.ts` is also inside
  `[0, 1]`.
- **No filter on anything that moves.** The bloom and the spark are painted
  radial gradients rather than blurred shapes, because both of them scale.
- **The grey thread is authored grey.** `filter: grayscale()` on a wrapper
  that is being scaled repaints it every frame.

### Static composition

`@media (prefers-reduced-motion: reduce), (scripting: none)` drops the pin,
removes the plate and un-stacks the core into a column. The same block covers
reduced motion and no-JS, so `layout.tsx`'s `NOSCRIPT_REVEAL` did not need a
new entry — this section's server HTML is visible by default, not hidden.

### Validation

`tsc` clean, `eslint` clean, production build clean. DNA canvas **60fps at
every beat and 60.3fps scrubbing the whole runway** (hero and Rooms controls
both 60fps). No horizontal overflow at 320/375/390/768/1024/1280/1440/1920;
the composition fits inside the pinned stage at all of them, including
320x568. Knock sequence: exactly two marks, exactly two flashes, 332–357ms
apart, replayable, holding from 0.84 down to 0.66. Rooms re-walked at 7 stops
and unchanged; hero screenshot-verified intact. The welcome video is never
requested; S2's avatar image is the URL the hero already loads.

### Note on measuring this page

A long-lived `next dev` server was serving stale hot-reloaded modules where
**every** framer scroll value was frozen at 0 — Rooms included, not just the
new section. If scroll-linked animation appears completely dead, measure
against `next build && next start` before believing it. Restart that server
after every rebuild, or it serves a build whose assets no longer exist.

### Files added

- `src/components/sections/Arrival/Arrival.tsx`, `ConversationThread.tsx`,
  `ArrivalMedia.tsx`, `score.ts`, `index.ts`
- `src/styles/arrival.css`
- `src/lib/site-config.ts` — `arrivalThread`, `arrivalMedia`; `#arrival` nav
  flag flipped to `ready: true` (the label is still unresolved and was **not**
  renamed)

---

## Phase 2 — S3 The Range

The asset audit, the composition and the known limitations are in
[LANDING_PAGE_STRATEGY.md](./LANDING_PAGE_STRATEGY.md). This is what an
implementer needs before touching the files.

### The trap: a masked reveal can never fire on `whileInView`

This one cost real debugging time and will bite again.

`IntersectionObserver` clips the intersection rectangle against **ancestor
`overflow: hidden`**. `.text-reveal` is exactly that — a mask holding its line
110% below itself — so the line reports an intersection ratio of **0.05** no
matter where the page is scrolled, and `viewport={{ amount: 0.5 }}` never
fires. The headline simply never appeared, at any scroll position.

**The observer has to sit on the unclipped wrapper**, with the masked line
following as a variant:

```tsx
<motion.span className="text-reveal" initial="hidden" whileInView="shown"
             viewport={{ once: true, amount: 0.5 }}>
  <motion.span className="text-reveal-inner" variants={{ hidden: {...}, shown: {...} }} />
</motion.span>
```

`TextReveal` does not hit this because it animates from `animate` on mount —
but that is also why it is not used here: for a section this far down the
page its reveal is over long before anyone scrolls to it. (The same is true
of the Rooms title today. Left alone; not this phase's file.)

### The knock is imported, not copied

`KnockMarks.tsx` imports `KNOCK_BEATS` from `Arrival/score.ts`. The gap
between the two hits is the brand, and two copies of it would drift apart.
S2 owns the constant; this is a read-only reuse and S2 was not modified.
**When a phase is allowed to touch both sections, move it to `src/lib/`.**

S2 arms from scroll progress (it is pinned); S3 arms from `useInView` (it is
not). Both perform on a clock. Measured across 5 / 14 / 90 px per frame:
332 / 333 / 349ms. Scroll speed does not touch the rhythm.

### The waveform is a drawing

There is no audio anywhere in this project. `VoiceWave` therefore has no
transport controls, no duration, no scrubber, and **stops moving once it has
drawn** — a waveform that keeps animating reads as playback. Generated
deterministically (three sine terms under one envelope) so SSR and the client
produce the same path. `pathLength` draw-on measured free against the DNA
canvas.

If real voice assets ever arrive, that is the moment to reconsider controls —
not before.

### Why there is no state machine

An earlier plan had the avatar's halo walking purple -> magenta -> cyan as
each state came into view. It was dropped: with one avatar pose the avatar is
the *constant*, and the honest way to carry the brand gradient is the **spine**
— a static CSS gradient on a 1px rule through all three states. That removed
three `IntersectionObserver`s, all the glow, and any implication that the
avatar reacts. The section is calmer and cheaper for it.

### Scroll

No `sticky`, no `useScroll`, no scroll-linked value, no scroll container.
Verified by walking every width and asserting nothing inside `#range`
scrolls independently. This is the pacing relief between two pinned
sequences and it has to stay that way.

### Navigation — deliberately NOT flipped

Phase 0's contract says the phase that builds a section flips its `ready`
flag, and Phase 1 did exactly that for `#arrival`. **Phase 2 did not**, on two
grounds: the phase brief explicitly said not to modify navigation, and unlike
"Flow & Motivi" the label "Features" carries its own pending rename
("What it does"). `#range` exists and resolves; the link is one line away
when both are cleared.

### Validation

`tsc` clean, `eslint` clean, production build clean. DNA canvas **60fps** at
the head, the waveform and the knock, and **60.1fps scrubbing the section end
to end** (hero, S2 and Rooms controls all 60fps). No horizontal overflow and
no scroll container at 320/375/390/768/1024/1280/1440/1920; every reveal
completes at all eight. Exactly two knock marks everywhere (four page-wide:
two in S2, two here). Reduced motion shows all three states, both headline
lines, the avatar, the drawn waveform and both marks, with no transform.
S2 re-walked at 11 stops and Rooms at 7 — both identical to their recorded
baselines; hero and footer verified unchanged. No new network cost: S3's
avatar is the same optimised URL the hero already loads, and the welcome
video is still never requested.

### Note for the next measuring pass

`html` has `scroll-behavior: smooth`, so per-frame scripted scrolling must
pass `behavior: "auto"` explicitly — otherwise each step supersedes the last
and the page barely moves, which looks exactly like a broken trigger.

### Files added

- `src/components/sections/Range/Range.tsx`, `VoiceWave.tsx`,
  `KnockMarks.tsx`, `index.ts`
- `src/styles/range.css`

---

## Phase 3 — S4 Rooms polish

Polish, not a rebuild. The depth stack, the scroll architecture, the caption
and the progress indicator were all left exactly as they were — they work.
What the section needed was pacing, an ending, and two performance fixes.
The numbers and the creative reasoning are in
[LANDING_PAGE_STRATEGY.md](./LANDING_PAGE_STRATEGY.md).

### Heights are arithmetic, not taste

The section is `intro + runway + payoff`, and the strategy caps any section
at 300vh. Measure the three parts before touching the runway:

```
intro   47vh  (eyebrow + 2-line title + 1-line lead + padding)
runway 220vh  (the only part worth spending on)
payoff  30vh
        ----
        297vh at 1440x900
```

The runway minus one viewport is the travel, and the travel divided by three
is the band per world. At 220vh that is 40vh a world, so a crossfade
(`ROOM_FADE` = 0.3 of a band) is 12vh. Below about 200vh the crossfade drops
under a tenth of a viewport and starts reading as a cut. **That is the floor,**
not the 300vh cap.

### The two-decode window is one number

Two videos decoding at once halves the DNA canvas. The window where that
happens is bounded by exactly two things:

- it **opens** at `WARM_AT` (the incoming world starts playing), and
- it **closes** at 0.85 of the band, when the label swaps and the outgoing
  world freezes — that is `ROOM_FADE / 2` before the band boundary.

So the window is `0.85 - WARM_AT` of a band. It was 0.72, giving 13%; it is
now **0.82, giving 3%**. Nothing else needs touching to tune it.

**What this does not fix:** the *depth* of the dip. Two simultaneous software
decodes cost what they cost — still ~30fps inside the window. Only its
duration improved, by about three quarters. Do not record this as "fixed".

To find the window rather than guess at it, step progress in 0.01 increments
and count `.room-scene video:not(:paused)`. Sampling at round numbers like
0.33 misses it entirely and reports a comfortable 56fps.

### Staged preload

`isEager={index === 0 || isOnScreen}` picks `preload="auto"` vs
`"metadata"`. `metadata` still issues a request — the win is bytes, not
request count, so measure `Network.dataReceived` and not
`requestWillBeSent`. At the arming moment: **6.2MB -> 2.5MB**.

The two deferred worlds finish loading during the first world. Verified by
asserting `readyState === 4` on all three at every walk stop; if that ever
fails, the first visible frame of a room will be stale.

### Room 03 breaking frame: measured, then dropped

The portal clears the caption by **23px**. Full-bleed width at 1440 needs
`scale(1.207)`, which pushes the frame 54px past each edge — 31px into the
caption. The largest collision-free scale is 1.088, which is not a frame
break. Rejected. If anyone revisits it, move the caption out of the portal's
growth path first; a bigger scale value is not the missing piece.

### Hero, mid-phase

`<KnockPortal />` was deleted from the hero by the owner while this phase was
running — confirmed intentional. `tsconfig` has `noUnusedLocals`, so the
orphaned import was a hard **build** error, not a lint warning; the whole
toolchain was red until it was removed. That one line is the only Hero change
in this phase. `KnockPortal.tsx`, `portalY` and the empty
`.hero-portal-slot` wrapper are all still there, so restoring the artwork is
one line — and the leftover wrapper and parallax value are dead weight until
someone decides which way it goes.

### Validation

`tsc` clean, `eslint` clean, production build clean. Runway re-walked at 7
stops at 1440 and 390: clean 1/0 opacities, one decoder outside the crossfade,
`readyState` 4 throughout, glow and caption tracking the picture. No overflow
and **no nested scroll container** at 320/375/390/768/1024/1280/1440/1920;
caption fits inside the stage at all eight. Section 274–298vh. DNA 60fps
pinned and scrubbing, 56.7fps on the disco world, ~30fps in the 3% two-decode
window. Reduced motion: zero transforms on all three worlds, no scrims
rendered, payoff fully visible. S2 re-walked at 11 stops and S3 at 8 widths —
both identical to their recorded baselines.

### Files changed

- `src/components/sections/Rooms/Rooms.tsx` — lead, payoff, `WARM_AT`, `isEager`
- `src/components/sections/Rooms/RoomScene.tsx` — staged `preload`
- `src/styles/rooms.css` — runway heights, intro padding, payoff
- `src/components/sections/Hero/Hero.tsx` — one orphaned import, see above

---

## Tailwind Migration

A migration, not a rewrite. The rule applied throughout: **Tailwind where it
removes a layer of indirection, CSS where CSS is the clearer technical
answer.** Anything whose conversion risked changing a rendered pixel stayed
in CSS.

### How it was verified

Every step was checked against a computed-style fingerprint, not by eye: all
~240 elements on the page, ~96 computed properties each plus `::before` and
`::after`, captured at **8 widths under reduced motion** (deterministic
layout) **and 10 scroll anchors under normal motion** (the pinned
compositions reduced motion un-stacks). Roughly 280,000 comparisons per run.

**Establish the noise floor first.** Two consecutive captures with no code
change diffed to zero, which is what makes any later difference trustworthy.
The harness lives in the session scratchpad as `tw-capture.mjs` /
`tw-diff.mjs`; rebuild it the same way if this is ever repeated.

**Result: zero geometry differences** (no rect x/y/w/h change anywhere, at
any width, at any scroll position) and zero differences in colour, spacing,
type, background, shadow, opacity, z-index, display or overflow.

### What moved to Tailwind

| Was | Now | Outcome |
|---|---|---|
| `page-shell.css` | utilities on `page.tsx` / `DNAAnimation.tsx` | **file deleted** |
| `buttons.css` | `Button.tsx` | **file deleted** |
| `.store-badge*` + app label (10 rules) | `StoreBadges.tsx`, `Footer.tsx` | removed from `footer.css` |
| `.room-progress*` (7 rules) | `RoomProgress.tsx` | removed from `rooms.css` |
| `.site-header-secondary`, `.site-mobile-actions .btn`, `.site-header-actions .btn-primary` | variants on the buttons | removed from `site-header.css` |
| `.container`, `.page-inline`, `.glass`, `.glass-control`, `.glass-blur`, `.glow` | nothing — all six were dead | removed from `utilities.css` |

Those six were a second vocabulary for values `@theme` already generates
utilities for (`bg-glass`, `border-border-subtle`, ...), and none were
referenced by any component. Keeping both is how the two drift apart.

One addition, in `globals.css`:

```css
@custom-variant interact (&:hover, &:focus-visible);
```

The stylesheets kept repeating `.x:hover, .x:focus-visible` pairs. One
variant means a pointer style and its keyboard equivalent cannot drift apart.

### Three traps this migration hit — read before doing more

**1. A components-layer rule can no longer beat a migrated component.**
This is the one that bites silently. `.site-header-secondary { display: none }`
hid the ghost CTA below 760px. The moment `.btn`'s `display: inline-flex`
became a *utility*, the stylesheet rule lost — utilities outrank
`@layer components` — and the button reappeared at every width. **Whenever a
primitive moves to utilities, every stylesheet rule that overrides it must
move too**, as a variant on the element (`max-[760px]:hidden`).

**2. Font-size tokens carry their paired line-height; the old rules did not.**
`--text-body` has `--text-body--line-height: 1.6`, so `text-body` sets both.
The `.btn-lg` rule it replaced set `font-size` alone, leaving the line box at
`normal`. The large CTA silently grew **49px -> 54px**. Fixed with
`leading-[normal]`. Check the line-height any time a `text-*` token utility
replaces a bare `font-size`.

**3. Utility order is not className order.** `.btn-lg` beat `.btn-primary` on
padding purely because it was written later in the file. Two padding
utilities in one string are settled by the order Tailwind emits them, which
is not the order they are written. `Button.tsx` therefore resolves padding to
exactly one value per size/variant instead of layering two.

Also worth knowing: `font-medium` resolves to `--font-weight-medium`, which
is **600** here, not 500. A rule authored at a literal `500` needs `font-[500]`.

### Two accepted residues, both proven non-visual

The fingerprint still reports these, and they are the only differences left:

- **`border-style: none` -> `solid` on the primary buttons.** `border-width` is
  `0px` in both (confirmed in the fingerprint), so nothing paints. Tailwind's
  preflight already zeroes borders, so a `border-none` on the base would only
  have started a fight with the ghost variant's real border.
- **Transition lists serialize shorter.** `transition-property` and
  `transition-duration` *values* are identical; only the repetition differs
  (`ease, ease, ease, ease` vs `ease`). CSS repeats these lists to match
  `transition-property`, so behaviour is identical. Matching the serialization
  would need a full arbitrary `transition` shorthand and worse code.

### What deliberately stayed CSS

Roughly 18% of all declarations are `clamp()` scales, gradients, container
queries, `svh` maths, `background-clip`, filters or `will-change`, and most
of the rest live behind pseudo-elements, attribute selectors, custom
breakpoints or reduced-motion blocks. Converting those buys nothing and
costs readability, so **none of it moved**:

- **`base.css` untouched.** It is the page's stabilization against Tailwind
  preflight — including the `line-height: normal` reset that once resized
  every element. Do not "tidy" it.
- **`sections.css` untouched.** Preserved future-section design.
- **`tokens.css` values untouched.** `@theme` is the source of truth and is
  what makes `bg-void` / `rounded-control` / `text-label` work at all.
- **All animation choreography** — S2's score and plate, S3's waveform and
  reveals, Rooms' depth stack, the DNA canvas, every keyframe, mask,
  `transform-origin` and reduced-motion block.
- **`.text-gradient` and `.text-reveal`** — the `background-clip` pair and the
  overflow mask, both with override hooks that utilities cannot express.
- **Every `clamp()` type ramp and the oversized footer wordmark**, whose
  `cqw` container-query sizing and layered gradients would become unreadable
  as arbitrary values.

No Framer Motion logic was touched: `useScroll`, `useTransform`, `useInView`,
the motion values and `KNOCK_BEATS` are all unchanged.

### Validation

`tsc` clean, `eslint` clean, production build clean. No dependency changes.

- Fingerprint: **0 geometry differences**, 8 widths x 10 scroll anchors
- No horizontal overflow at 320/375/390/768/1024/1280/1440/1920
- DNA: 500 particles, unchanged drift and scroll reaction, **60fps** at every
  sampled point and while scrubbing
- S2: walk identical at all 11 stops; two knocks, 331-382ms apart, replayable
- S3: identical at all 8 widths; waveform drawn; exactly two marks; rhythm
  330-333ms and independent of scroll speed
- S4: walk identical at 7 stops, one decoder outside the crossfade, all
  videos `readyState` 4, captions and glow tracking, payoff intact; section
  274-298vh
- Hover and focus-visible driven with real input on the migrated badges:
  border, background and shadow match the removed rules exactly
- Reduced motion unchanged across S2, S3 and Rooms

---

## Phase 5 — Tailwind cleanup + AOS

Tailwind is now the primary styling system. The line drawn, and the one to
keep drawing: **a stylesheet earns its place by carrying scroll
choreography, a mask, pseudo-element geometry or a measured performance
decision. Everything else is a utility on the element.**

### What converted

| Was | Now | Outcome |
|---|---|---|
| `site-header.css` (29 rules) | `SiteHeader.tsx` | **1 rule left** — the menu icon |
| `footer.css` (25 rules) | `Footer.tsx` | **2 rules left** — panel, wordmark |
| `newsletter.css` (22 rules) | `Newsletter.tsx` | **13 rules left** — panel, arcs, phone fan |

`hero.css`, `arrival.css`, `range.css` and `rooms.css` were not touched.
They are the four scroll-choreographed sections; converting them buys
percentage and costs the thing that makes them readable.

Long class strings live in module-scope constants (`BAR_BASE`, `NAV_LINK`,
`LINK`, `TOP_LINK`), the pattern Button.tsx already used.

### The breakpoint bug — read this before converting another media query

**`max-[1024px]:` is not `@media (max-width: 1024px)`.** Tailwind v4 compiles
it to `@media not (min-width: 1024px)`, which is `width < 1024px` and
therefore EXCLUDES exactly 1024px. Every rule being replaced was written
`max-width`, which includes it. At exactly 1024px the desktop nav reappeared
beside the burger.

The fingerprint caught it because 1024 is one of the sampled widths. The
same off-by-one was already shipping from the previous phase on
`max-[760px]` (the ghost CTA) and `max-[560px]` (the store badges), where it
had never been caught because those exact widths were never sampled.

Fixed at the source with exact-equivalent variants in `globals.css`:

```css
@custom-variant upto-1024 { @media (max-width: 1024px) { @slot; } }
```

`upto-1024`, `upto-900`, `upto-760`, `upto-560`, `upto-360`. Use these for
any max-width conversion. `min-[Npx]:` needs no equivalent — min-width is
inclusive in both syntaxes. Verified at the boundary: nav hidden at 1023
**and** 1024, visible at 1025; ghost CTA hidden at 760, visible at 761.

### Three more conversion traps

- **`transition-transform` is wider than `transition: transform`.** It covers
  `transform, translate, scale, rotate`. Use `transition-[transform]` to
  match a rule that transitioned the one property.
- **`border-t` plus a bare border colour colours all four sides.** The
  shorthand `border-top: 1px solid X` sets only the top. Use
  `border-t-<colour>`. Invisible while the other three widths are 0 — until
  someone adds a border.
- **A settled `translate3d(0,0,0)` pins a compositor layer for the life of
  the page.** AOS's own animations end there. Ending on `transform: none`
  drops the layer; CSS interpolates to `none` as the identity matrix, so the
  movement is unchanged. Eight static text blocks were being promoted, and it
  also made Chrome report `margin-inline: auto` as `0px` on an unrelated
  centred panel whose box had not moved.

### AOS

Added as `aos@2.3.4` + `@types/aos`, initialised once from `layout.tsx` via
`components/animation/Aos`. Used on eight simple reveals: the four blocks of
the invite banner and the four of the footer.

**Its stylesheet is never imported.** AOS's JavaScript only toggles
`aos-init` / `aos-animate`; every animation it ships is plain CSS. This page
needs two reveals, both in `styles/aos.css`, so importing 26KB to use a few
percent of it would be dead weight. Stagger uses Tailwind `delay-*`.

**The hidden state is gated on `.aos-init`, not on `[data-aos]`.** That class
only exists once AOS has run, so no-JavaScript and reduced-motion both land
on visible — the opposite of the usual data-attribute reveal, where a script
failure leaves the page blank. Four `NOSCRIPT_REVEAL` selectors in
`layout.tsx` were deleted because of it.

It paid for itself in one place: the invite banner has no Framer left and is
no longer a client component at all. The footer dropped framer-motion too,
reading `prefers-reduced-motion` directly at click time for back-to-top.

**Where AOS must not go, and why that is measured rather than stylistic.**
AOS fires on an absolute document offset — `offsetTop + offset` against
`scrollY + innerHeight` — captured once at init. For the last elements on a
page that sum can exceed the furthest the page can scroll, and the reveal
then never runs at all. Measured at 390x844 with the global 90px offset, the
footer wordmark's trigger sat **27px** inside the maximum scroll position:
the site's signature element was one layout change away from never
appearing. `data-aos-offset="-160"` on the bottom two reveals takes the
margins to 277px and 370px.

IntersectionObserver — what Framer's `whileInView` uses — cannot fail this
way. So: **AOS for simple reveals with room above the page floor; Framer for
anything scroll-linked, pinned, percentage-based or near the bottom.** Check
the arithmetic before adding a ninth.

AOS also throttles its scroll handler at 99ms, so its reveals lag a fast
flick by up to ~200px where Framer's do not. Acceptable on a footer; not on
anything the eye is tracking.

### Correction to the measuring note above

**`window.scrollTo({ behavior: "auto" })` does not force an instant jump.**
In the options dictionary `auto` means use the element's computed
`scroll-behavior`, and this page sets `scroll-behavior: smooth`. Scripted
scrolling that must land immediately has to pass `behavior: "instant"`.
Measured: `scrollTo({ top: 3000, behavior: "auto" })` read `scrollY = 0`
immediately after and `1803` 300ms later. Earlier passes were unaffected only
because they waited 1.2-2.2s after each scroll.

### Validation

`tsc` clean, `eslint` clean, production build clean.

- Fingerprint vs pre-phase baseline: **0 geometry differences**, 8 widths x
  10 scroll anchors, ~280,000 comparisons. 20 elements differ, all accounted
  for: the 8 AOS reveals, the header bar and the back-to-top button
- Remaining property differences are all proven non-visual: Tailwind's four
  transparent zero-size `box-shadow` placeholders; transition-list
  serialization with identical values; `background-position` on an element
  whose `background-image` is `none`; and `opacity` on the AOS blocks, which
  reduced motion now leaves visible instead of waiting for a scroll trigger
- DNA canvas 500 particles, **60fps** at hero, range, rooms, invite, footer
- Header dense state, nav pill, mobile menu, both hover nudges driven with
  real input and matching the removed rules
- No horizontal overflow at 320/375/390/768/1024/1280/1440/1920
- Reduced motion: every `data-aos` attribute removed, no `.aos-init`, and
  **0** unexpectedly hidden elements. Fixed one real bug found here — the
  invite banner's phone fan stayed at opacity 0 beside copy that was visible
- 0 console errors or warnings in either motion mode; 8 `.aos-init` elements,
  so no duplicate initialisation

---

## Phase 6 — S2 rebuilt around the welcome video

The client asked for three things: make the flat half bigger, change both
headlines, and put the welcome video in the frame **with its knocking sound**.
All three are in. Two of them turned up facts that contradict what this
document previously assumed.

### The video is not what the config said it was

`site-config.ts` claimed the welcome video was 1440x1080, and the frame was
authored at 4:3 on that basis. It is **1440x1440 — square**, 5.038s, with a
real AAC audio track. The frame now takes its aspect ratio from
`arrivalMedia.ratio` as an inline custom property, so the media and its
container cannot disagree again. Verified square at all eight widths.

### The video knocks six times, not two

Decoding the audio track and taking an RMS envelope puts knock transients at
**0.39, 0.77, 1.04, 1.30, 1.64 and 1.96 seconds**; the filmstrip confirms it
— the avatar knocks six times and lowers its fist by ~2.3s.

Every brief so far has said *exactly two knocks, never three, never
repeated*. That rule was written to stop us **inventing** a knock rhythm. It
cannot bind the client's own footage, which is what the product actually
does. So: the video plays as supplied, and the page adds nothing to it. The
**two marks now ride the video's own first two hits** rather than running an
independent rhythm beside them — which is exactly what the old score comment
instructed whoever dropped the video in.

`KNOCK_BEATS` therefore comes from `arrivalMedia.knockBeats`, and
`KNOCK_PULSE` is derived from it so the frame kick can never drift from the
mark it belongs to. Measured: mark 1 at video t=0.442, mark 2 at t=0.822 —
a 0.380s gap against a 0.38s target. The ~50ms lead-in is the reveal's own
ease crossing 50% opacity; the marks *start* on the hit.

**They are timed from `onPlaybackStart`, not from the scroll threshold.**
The threshold requests playback; the video reports when it actually began.
Timing the marks off the request would desync them the moment the video
took a frame longer to start than expected.

### Sound: what a browser will and will not do

**Unmuted autoplay requires a real user gesture, and scrolling is not one.**
This is not a Chrome quirk — Chrome, Safari and Firefox all refuse. A
scroll-triggered `play()` on an unmuted element gets a rejected promise, or
in some browsers plays muted anyway without telling you.

`ArrivalMedia` therefore does three things in order, and all three are
measured:

1. try unmuted;
2. if the promise rejects **or the element comes back muted anyway**, play
   muted so the arrival still happens;
3. surface one control, `Hear the knock`, so it can be asked for.

| Case | Result |
|---|---|
| No gesture anywhere on the page | plays **muted**, control appears |
| Control clicked | unmuted, volume 1, replays from 0 |
| Visitor clicked **anything** earlier | autoplays **unmuted**, no control |

That third row is the normal case in practice, and it is why the client's
request is satisfied without a hack: activation is banked per document, so
anyone who has touched the header, a nav link or the hero CTA gets sound.

The control sits **top-right** of the frame. Bottom-left, where it started,
ran straight into knock mark 2 at every width — the frame is only ~340px
across. Its icon is an inline SVG; an earlier attempt drawing a speaker from
a box plus a bordered `::after` rendered as a plain square.

### Reduced motion does not autoplay a knocking video

The static composition holds the first frame and waits. WCAG 2.2.2 is about
moving content, and a five-second animation of someone hammering on a frame
is moving content. That left those visitors with no way to see it at all, so
`allowManualPlay` shows them the same control, which plays it with sound on
a real click. Verified: paused at t=0 on arrival, playing unmuted after.

### The flat half

Runway **240vh -> 290vh** (260 tablet, 235 mobile), still inside the 300vh
cap the strategy sets. The thread is eight messages, not five, and the score
was rebalanced so the flat half owns roughly **two thirds** of the runway:
the bubbles build to 0.30, the headline and `Seen 2h ago` hold together from
0.33 to 0.60, and only then does the collapse start. The boredom has to be
felt for long enough to be worth answering.

Copy: *Text is flat and boring.* / *What if someone knocks on your phone?*
with a new supporting line, *Send your avatar with your message*, on its own
stage row — not inside the headline grid, whose cell is sized by the taller
of its two lines and would resize mid-sequence.


### Follow-up: the headline was being clipped

Reported against a short browser window, and reproduced: at **1280x720 the
headline sat at y=64 with the floating header's bottom edge at y=70**, so
the first line was behind the header and the closer overflowed the stage by
5px.

**Cause: the stage centres content it can no longer fit.** `.arrival-stage`
is a `100svh` grid with `align-content: center`; when its children total
more than the height available, centring overflows the box equally in both
directions and the top half goes under the header. Going from five messages
to eight made the thread 436px tall, which was enough to tip it.

The earlier width sweep missed this because it parked at the arrival beat
(p=0.88), where the thread is collapsed. **Check the flat phase too — the
thread and the frame share a grid cell, and the cell is sized by whichever
is taller.** The sweep now samples p=0.42 and p=0.9 at every size.

Four things give the budget back, and all four are viewport-height aware:

| | Was | Now |
|---|---|---|
| stage padding-top | `clamp(96px, 13vh, 140px)` | `clamp(110px, 15vh, 160px)` |
| stage row gap | `clamp(20px, 3.4vh, 46px)` | `clamp(16px, 2.6vh, 40px)` |
| headline | `clamp(29px, 5.4vw, 76px)` | `clamp(29px, min(5.4vw, 8vh), 76px)` |
| bubble padding / size / gap | fixed 10px / 16px / 9px | `svh`-based clamps |

`min(5.4vw, 8vh)` on the headline is the one worth keeping in mind: a wide
but short window would otherwise pick a size off width alone and need more
vertical room than the stage has.

Measured after, across 14 window sizes from 1920x1080 down to 320x720:
headline clears the header by **53-151px** and the stage keeps **34-109px**
of slack at the bottom, in both the flat and the arrival phase.

### Follow-up: bigger frame, no knock labels

The frame went from `min(392px, 100%, 38svh)` to `min(470px, 100%, 46svh)`
(mobile `min(420px, 100%, 42svh)`) — 483px tall at 1920x1080 against 388px
before.

The two `Knock` labels are gone at the client's request. `KNOCK_BEATS` and
`KNOCK_PULSE` stay: the frame kick and the edge flash still ride the video's
first two real hits, so the page reacts to the knock without captioning it.
Nothing adds a knock of its own, which is the part of the old rule that
still matters. With the labels gone the `.arrival-knock` rules and the
560px override went with them.

**A frame-rate scare worth recording as a false alarm.** A scrub through the
turn measured a median of 47fps with a 44 minimum, which would have been a
real regression from the bigger layer. It did not reproduce: an ablation of
the bloom, the spark, the video and the frame size all returned 60, and so
did returning to the shipped config. Four fresh page loads x two scrubs each
then measured **60fps every time, first pass and second**. The low readings
came from a run taken immediately after killing a batch of stray Chrome
processes. **Do not tune against a single scrub sample on a busy machine.**

### Validation

`tsc` clean, `eslint` clean, production build clean.

- Sequence walked at 13 stops: bubbles 0->8, flat line holds 0.36-0.54,
  collapse, scrim lifts, spark, frame opens, video plays, marks, sub, closer
- 14 window sizes 1920x1080 to 320x720, flat phase AND arrival phase: **no
  whole composition inside the viewport, sound control never overlapping
  knock mark 2
- **0** knock labels in the DOM; the two impulses still ride the video's
  first two real hits
- Replay: scrolling out rewinds to t=0 and disarms the impulse; scrolling
  back in replays identically
- DNA canvas 500 particles, **60fps** at p=0.2/0.45/0.7/0.85/1 and while
  scrubbing the turn with the video playing
- Reduced motion: no pin, no plate, all copy visible, both marks shown,
  video paused at t=0 with a working manual control
- Everything outside S2: 4224 elements compared by path, differences are the
  vertical shift from the taller section plus 11 sub-pixel roundings

---

## Phase 7 — S5 Expression, the moving wall

A new section between Rooms and the invite banner: three columns of avatar
clips drifting in opposing directions, fading into darkness at both ends.

### Files

**Added** `src/components/sections/Expression/Expression.tsx`,
`src/components/sections/Expression/index.ts`, `src/styles/expression.css`.
**Modified** three lines total: one `@import` in `globals.css`, one import
and one element in `page.tsx`. No existing section was touched.

### The assets are five, not four

`public/expression-video-slider/` holds **five** clips, not the four the
brief expected: *Feeling Bored1*, *feeling sad*, *funny*, *thinking* and
*vibing on music*. All five are used. Every filename contains a space, so
each `src` is `encodeURIComponent`-ed — the same trap the S2 welcome video
hit. The files were not renamed, moved or altered.

All five are **1440x1440** and 5.17s. Four are full-body characters and one
(*funny*) is a close-up, which is why the cards are 4:5 with `object-cover`:
over a square source that trims 10% off each side and keeps every character
head to toe. Their backgrounds are already near-black, which is why they
dissolve into the page so cleanly.

### The marquee, and the half-gap trap

Each column holds its cards **twice** and animates `translateY` between 0
and -50% (reversed for the downward column). At -50% the second copy sits
exactly where the first began, so the loop has no seam, needs no
measurement, no scroll input and no per-frame JavaScript. Transform-only CSS
keyframes, so the compositor owns it and the DNA canvas is untouched.

**The gap has to live on the cards, not on the flex container.** A `gap`
leaves `2n - 1` gaps in a strip of `2n` cards, so -50% lands half a gap away
from the seam and the loop jumps once per pass. `margin-bottom` on every
card makes the strip exactly `2n x (card + gap)`. Verified: seam error
**≤ 0.09px** at all six required widths.

Column durations are 46/54/50s — deliberately unequal, so the three never
fall into step. Movement is independent of scroll, so a fast flick cannot
change the rhythm.

### The frame-rate ceiling — one clip, and it is measured

This is the finding worth keeping. Steady-state DNA canvas frame rate with
the section on screen, **GPU decoding enabled**:

| clips playing | DNA canvas |
|---|---|
| 0 | 60fps |
| 1 | 60fps, sustained |
| 2 | 30fps |
| 3+ | 30fps, every time |

There is no slope — the second clip halves the page. The cause is source
size: each clip is 1440x1440, **2.1 megapixels, twice a Rooms clip**
(1536x672), drawn about 315px wide. Rooms holds 60fps with one clip of half
that size, which is the budget this page has.

So `MAX_PLAYING = 1`. The card nearest the middle of the viewport plays and
the rest hold a still frame, selected by an IntersectionObserver whose root
is shrunk to the centre band (`rootMargin: -34% 0px -34% 0px`). The columns
still drift continuously, which is the section's real movement and costs
nothing. **If the clips are ever re-exported near display size, raise the
cap and re-measure.**

Two dead ends recorded so nobody repeats them:

- **A first ablation blamed `mask-image` for the drop.** It was wrong —
  confounded by sampling right after pausing every clip. A clean pass put
  the entire cost on the number playing: hiding the videos returned 60fps
  while removing the mask, the scrims, `will-change` and the card shadows
  each changed nothing. The fade is still two painted scrims rather than a
  mask, because that is what was asked for and it is simpler — not for
  frames.
- **Clips kept playing after the section scrolled away**, holding the page
  at 30fps behind the invite banner. A section-level observer now pauses
  everything when the section leaves.

### Loading

Sources are attached by the observer, not rendered in JSX. Rendering `src`
on all eighteen cards had all eighteen downloaded and decoded the moment the
section approached — **including the third column, which is `display:none`
on a phone**. A hidden element never intersects, so it now never loads:
decoded clips dropped from 18 to 8 on mobile. React never writes `src`, so
there is no reconciliation to fight over.

### Responsive

Three columns from 761px up; **two opposing columns below**, with the third
dropped via `upto-760:hidden` rather than squeezed. Card size follows the
column, from 315px wide at desktop down to 131px at 320px. Gallery is
`min(980px, 100%)` wide and `clamp(470px, 84vh, 920px)` tall, so roughly two
cards per column are in view and the wall reads as a wall.

### Reduced motion

The drift stops, the duplicated half is removed (`motion-reduce:hidden` on
the clone — a **utility**, because a components-layer `display:none` cannot
beat the card's own display utility, exactly the trap in the Tailwind
migration notes), and clips are armed for their first frame but never
played. A wall of looping video is moving content.

### Validation

`tsc` clean, `eslint` clean, production build clean. No new dependencies.

- **Zero horizontal overflow** at 320/390/768/1024/1440/1920
- Columns measured moving in opposing directions: -68.8px / +58.6px /
  -63.4px over 2.5s
- Seam error ≤ 0.09px at every width
- **60fps** at hero, range, rooms, the expression wall and the invite banner,
  with one clip playing
- Exactly 1 clip playing at a time; 8-13 armed for still frames
- Reduced motion: strips static, clones hidden, nothing playing
- 0 console errors or warnings
- Existing sections untouched — the whole diff outside the new files is
  three added lines

### Phase 7b — Expression visual polish

Composition only. The marquee, the video-loading strategy and the
one-clip-at-a-time cap are untouched.

- **The gallery now clips (`overflow-hidden`), and that was the actual bug.**
  Each strip is translated by up to -50% of its own height, and with no clip
  those cards rendered *outside* the gallery — over the headline, above the
  top scrim where nothing could fade them. That is what made the section
  feel crowded. The clip edge is never visible because the scrims take the
  content to full black well before it.
- Space between the copy and the wall: **55px -> 107-121px**.
- Wall is larger and more immersive: `min(980px)` -> `min(1120px)` wide,
  84vh -> 90vh tall, cards 315x394 -> 362x452 at desktop.
- Scrims deepened (18%/20% -> 30%/28%) with a three-stop falloff, so clips
  dissolve well before either edge.
- Removed the last per-clip decoration: the mood pills. Nothing is drawn on
  a clip now — no border, shadow, hairline, badge or glow. Separation comes
  only from darkness, spacing, the ambient wash and the scrims.
- Headline capped 82px -> 74px so it stays the hero without eating the wall.
- **Hover no longer pauses a column** (client request). The drift is the
  section; stopping it under the cursor made the wall feel like a control.
  Columns run continuously, always. Hover keeps only the scale and lift.

Validated: no horizontal overflow at 320/390/768/1024/1440/1920; seam error
≤ 0.09px; directions still up/down/up; 60fps at hero, range, rooms, the wall
and the invite banner; one clip playing; reduced motion static with clones
hidden and nothing playing; `lint`, `tsc` and `build` clean.

---

## Phase 8 — Rooms as a horizontal film strip

The depth stack is gone. The three rooms no longer crossfade in place; they
sit edge to edge in one strip and vertical scroll drags it right to left.

**Files:** `Rooms.tsx`, `RoomScene.tsx`, `rooms.css`. Nothing else.

### The travel is a constant, not a measurement

The strip is `width: max-content` holding three panels, so it is exactly
3x a panel wide. Moving from room one centred to room three centred is a
shift of two panels — **exactly `-66.6667%` of the strip itself**. Because
it is a percentage of the element, it never has to be measured and never
changes with the breakpoint, so the panel can be any width the layout wants.

`margin-left: calc((100% - var(--room-panel)) / 2)` on the strip parks room
one in the middle at `x = 0`. That is the whole geometry.

The strip is parked for the first 6% and last 12% of the runway, so rooms
one and three are still long enough to be looked at. `overflow: hidden` on
a full-bleed viewport is what keeps a transformed strip from ever reaching
the page's scroll width — there is no nested scroller, only a transform.

### The one-decoder rule, re-confirmed the hard way

The first cut let two rooms decode while the strip was between panels, on
the theory that two 1536x672 clips (2.1Mpx together) cost about what one
1440x1440 Expression clip does. **That was wrong.** Measured, parked in a
settled two-decoder window with GPU decoding on:

| decoding | DNA canvas |
|---|---|
| 1 | 60fps |
| 2 | 30fps |

And nothing else in the section costs anything — hiding the videos restored
60fps, while removing the fades, the glow and `will-change` each changed
nothing. **The limit is the number of decoding video elements, not their
pixel count.** One at a time, page-wide. The outgoing room now freezes on
its last frame as the strip moves on; it is half off the viewport and
behind the side scrim by then, which is the same trade the depth stack made.

A second stall came from `isEager={index === 0 || isOnScreen}`, which
flipped all three to `preload="auto"` the instant the section was reached
and put two more full downloads on the wire — 13fps at the entry. It is now
`index === 0 || (isOnScreen && index <= active + 1)`, so at most the current
and next room preload in full.

### Composition

- The intro stays **outside** the pinned runway, so the heading is read at
  full size before anything moves and is never cropped by the pin. Measured:
  it clears the header at every width, with 305-392px between it and the
  strip.
- Panels touch — **no gap, no border, no shadow, no radius**. Measured gap
  between panels: 0px at all six widths.
- Labels moved into the panels, so each room's ordinal, name and line
  travel with it instead of being a separate caption that swaps.
- Four painted scrims (top, bottom, left, right) dissolve the strip into
  darkness at every edge. Scrims rather than a mask, for the reason recorded
  in the Expression notes.
- Narrow screens get a narrower panel **and a taller crop** — 2.29:1 on a
  phone is a letterbox with nothing readable in it. 78vw/2.29 on desktop,
  86vw/1.78 under 900px, 88vw/1.33 under 560px.

### Validation

`lint`, `tsc --noEmit`, `build` all clean.

- 320/390/768/1024/1440/1920: **zero horizontal page overflow**, zero gap
  between panels, rooms centre 1 -> 2 -> 3 across the runway
- Travel lands exactly two panels (-2240px at a 1120px panel)
- **60fps** across the whole runway, and at range, expression and the invite
  banner; the entry samples 53fps and settles to 60 within ~2s while the
  clips finish loading
- Exactly 1 decoder at every sampled point
- Reduced motion: no pin, no transform, strip becomes a column, all three
  rooms and all three labels present, nothing playing, no overflow

### Invite banner — phone composition and hover target

Composition only; the panel, arcs, gradient, typography and CTA are
untouched. `PhoneStack.tsx` and three values in `newsletter.css`.

- **Overlap `-0.46` -> `-0.30` of a screen's width.** At the old figure each
  screen covered nearly half the one behind it and the three merged into a
  single silhouette. Screen width dropped `196px -> 180px` and the desktop
  `padding-right` went `26vw/400px -> 27vw/415px` so the wider fan does not
  crowd the copy: measured clearance from the copy to the fan is now 138px
  at 1440 (it was about 40px).
- **The three tilts are no longer equal** (-18/-12/-19). A shared angle with
  an even step is what made them read as one folded sheet.
- **The hover target is the whole panel, not the fan.** Previously the
  effect only existed if the pointer happened to reach the right-hand third
  of the section; now reading the copy or moving to the CTA drifts the
  screens apart. The listener is attached in `PhoneStack` to
  `closest('.newsletter-panel')` — `Newsletter.tsx` is a server component
  and this keeps it that way. `pointerenter`/`pointerleave`, which do not
  bubble, so moving between children inside the panel never re-fires them.
- The entrance and the hover now share one `animate` prop. Framer ranks
  `whileInView` above `animate`, so keeping the reveal on `whileInView`
  while driving hover from state would have had the two fighting for the
  same element.

Verified: hovering the headline moves all three screens by different
amounts (-18/+27, +2/-36, +19/-31 px) and leaving the panel returns them
exactly to rest; reduced motion shows all three at full opacity and ignores
hover entirely; no horizontal overflow at 320/390/768/1024/1440/1920.

---

## Phase 9 — S3 rebuilt as a room of six

S3 is the section headed **"Your face. Your voice. Your knock."** It
shipped in Phase 2 on the *fallback path* because the repository held
exactly one avatar in one pose, and the strategy recorded the upgrade for
the moment more arrived. Six profile renders landed in
`public/avatar-profile-img/`, which is that moment.

**Files:** `Range.tsx`, `cast.ts` (new), `KnockMarks.tsx` (one prop),
`range.css`. `VoiceWave.tsx` is reused untouched. Nothing outside S3.

### The concept, and the one that was rejected first

Patterns surveyed: kinetic type as an architectural element rather than a
headline block; broken/organic grids where asymmetry carries the
hierarchy; layered depth as the cheap way to make a flat composition feel
inhabited; hover as revelation, one element waking while its neighbours
recede. Ruled out on inspection: bento/card grids, cursor-followed
magnetic fields (per-frame JS over a canvas that is already painting), and
a second marquee wall — S5 Expression is already exactly that.

**A first build — six people scattered as a scroll-driven constellation
with a signal arc between two of them — was rejected on review.** It was
quiet to the point of being hard to read: six roughly equal circles on
black, with the argument spread across five small labels. What replaced it
is louder and much more legible, and it came from a reference the client
supplied: **a band of moving type cutting the composition on a tilt, with
portrait plates standing on either side of it.**

### What the composition is

- **The band** carries the five steps — find your people, invite them in,
  show how you feel, send your avatar, knock their phone — as one line
  that never stops. They read as a sequence rather than as a list, and the
  same words come round again every time the eye returns. It is full
  bleed at 132vw and tilted -3.6deg, so it runs off both edges of the
  window. The reference's flat yellow became the brand gradient with near
  black type: same device, Knocka's palette.
- **Two portrait plates** at the edges, tilted, with the person standing
  out over the top edge. Measured: 52px and 25px of head above the plate.
  This is only possible because the artwork is a cutout — the image is
  pinned to the plate's bottom and drawn *wider than the plate*, so its
  top escapes and the torso is cut off by the plate's own bottom edge,
  which is where the source images end anyway.
- **Four circles** in the corners, at four sizes.
- **Six different coloured grounds.** Five of the images are cutouts with
  real alpha, so the colour shows through everywhere the person is not.
  `avatar5.jpg` is the exception — a JPEG on white — so it fills its
  circle edge to edge and *its own white ground becomes its colour*, the
  sixth of six. Nothing about the markup differs between them.

### Two compositions, one set of numbers

Every profile carries two spots in `cast.ts` — `wide` and `narrow` — and
the stylesheet picks between them with one media query. That is what lets
the narrow layout be a different arrangement (head on top, band across,
the two plates side by side in the middle, circles in the corners around
them) rather than the wide one squeezed, with no resize listener, no
measurement and no second render path.

**It switches at 760, not the 900 the rest of the page uses.** Measured at
768: the wide composition still has room for both plates outside the
centre column, while the narrow one had to stretch a 205vw stage across
the width, which left the section airy and the people small.

### Traps this section hits

- **Framer owns `.knock-profile`'s transform**, so hover lives one level
  down on `.knock-plate`. An inline transform from framer wins over any
  `:hover` rule on the same element, every time.
- **Centring is the CSS `translate` property, not a transform.** The
  cascade applies `translate` before `transform`, so framer's entrance
  composes with it and no `calc(-50% + ...)` is needed anywhere.
- **The marquee's gap belongs on the items, never on the flex container.**
  A container gap is counted once and not twice, and the -50% seam opens.
  Verified: the two runs measure 1439.5px each, exactly equal.
- `next/image` with `fill` writes inline positioning styles that a
  stylesheet cannot override, so the plates use intrinsic `width`/`height`
  and let CSS place the artwork.

### Still the cheap section

No pin, no scroll container, no `useScroll`, no scroll-linked value — S3
is the pacing relief between two pinned sequences and stays that way.
Every entrance is a one-shot `whileInView`; the band is a CSS marquee and
hover is a CSS transition, including the "everyone else steps back" dim,
which is a `:has()` rule and not React state.

### Validation

`lint`, `tsc --noEmit`, `build` all clean.

- **Zero horizontal overflow** at 320/390/768/1024/1280/1440/1920 — the
  132vw band bleeds under `overflow-x: clip` on `<main>`, the same
  contract the hero and Rooms bleed under
- **DNA canvas 60.3fps** parked on the section
- All six profiles present and at opacity 1 at every width
- Hover: the hovered plate lifts, the other five drop to 0.5 opacity
- Reduced motion: all six visible, the band stopped with all five steps
  still present and in order, both knock marks landed, all three headline
  lines shown, no overflow
