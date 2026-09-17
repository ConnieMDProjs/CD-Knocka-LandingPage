# Knocka Landing Page — Strategy

**This document is WHAT and WHY.** `LANDING_PAGE_AGENT.md` is HOW and RULES
(implementation decisions, gotchas, measured traps). Read both before building.

Status: Header, Hero, S2, S3, S4 and Footer are built and polished. S5 and
S6 are not.

---

## 1. Positioning

| Role | Line |
|---|---|
| Display headline (built, do not change) | **FEEL THE MESSAGE.** |
| Brand / product proposition | **Don't text. Arrive.** |
| Category sentence | *Knocka is messaging where your avatar shows up — with your face, your voice and your reactions.* |

The display line carries the mood. The proposition carries the mechanic. The
category sentence exists so nobody has to guess what the product is, and it must
appear above the fold.

Use "Don't text. Arrive." in metadata, the S6 CTA, and social. Do not replace
the hero display type with it.

---

## 2. Product truth

**Shipping — describe in present tense:**

- Avatar-based messaging
- Customizable avatar
- Avatar expressions and reactions
- Voice communication
- Screen knocking
- Social rooms with avatars: coffee shop, disco club, ice cream shop

**Future — must be labelled "Coming later" or equivalent wherever it appears:**

- Couples mode, Gaming mode, Creator mode
- Moments (saving, sharing, downloading)
- Any other social-world concepts

Never render a future capability as if a visitor could use it today. This is a
credibility rule, not a copy preference.

---

## 3. Target emotional response

In order, as the visitor descends:

1. **Curiosity** — "what is this?" (S1)
2. **Recognition** — "that is exactly how texting feels" (S2 first half)
3. **Relief / delight** — "oh, *that* is the difference" (S2 second half)
4. **Understanding** — "I get what it does" (S3)
5. **Desire** — "I want to be in there with my friends" (S4)
6. **Anticipation** — "and it is going to get bigger" (S5)
7. **Action** — "I am in" (S6)

If a section does not move the visitor from one of these states to the next, it
does not belong on the page.

---

## 4. Design principles

1. **One idea per section.** A section that needs two sentences to explain its
   job is two sections, or none.
2. **Clarity before craft.** The page is already beautiful. It is not yet clear.
3. **Motion must carry information.** If an animation does not change what the
   visitor understands, delete it.
4. **The DNA canvas is the connective tissue.** It is the one element allowed to
   appear everywhere. Modulate its presence per section instead of adding new
   visual systems.
5. **Never fake anything.** No invented testimonials, user counts, or
   availability.
6. **The story must survive with motion disabled.** Test every section with
   reduced motion before calling it done.

---

## 5. Page architecture

```
HEADER  (built)
  S1  HERO / THE KNOCK          built    HOOK
  S2  THE FLAT -> THE ARRIVAL   new      CONTRAST + ARRIVAL     [scroll-linked]
  S3  THE RANGE                 new      EXPRESSION
  S4  ROOMS                     built    SOCIAL WORLD           [scroll-linked]
  S5  MODES                     new      FUTURE POSSIBILITY
  S6  THE INVITE                new      INVITATION
FOOTER  (built)
```

Six sections. The two scroll-linked sequences (S2, S4) are separated by S3 so
the visitor is never pinned twice in a row.

**Rhythm:** loud (S2) — quiet (S3) — loud (S4) — quiet (S5) — close (S6).

---

## 6. Section specifications

### S1 — HERO / THE KNOCK *(built — copy refinement only)*

**PURPOSE:** Hook. Establish that this is not a normal messaging product.

**USER QUESTION:** "What is this?"

**CORE MESSAGE:** Someone can show up in your messages.

**VISUAL:** Oversized FEEL THE MESSAGE., avatar knocking through a message
frame, DNA field behind. Built.

**CONTENT:** Eyebrow, headline, lead, one CTA.

**INTERACTION:** Entrance stagger, light parallax on scroll. Built.

**MOTION:** Category A (hero) + B (light parallax). Built.

**ASSET:** ~~`knocka-avatar-logo.png`~~ — **removed from the hero by the
owner during Phase 3, deliberately.** `<KnockPortal />` was taken out of the
portal slot; the hero is now copy-only over the DNA field. Phase 3 touched
Hero for one line only, deleting the import the removal orphaned, because
`noUnusedLocals` made it a hard build error. `KnockPortal.tsx`, the `portalY`
parallax value and the empty `.hero-portal-slot` wrapper are all still in
place, so restoring it is a one-line change. **The rest of this S1 spec still
describes the artwork and is now out of date on that point.**

**DESKTOP:** Copy 62% left, portal 42% right, 35–49px gap. Built.

**MOBILE:** Portal bleeds off the right edge, copy rides up over it. Built.

**PERFORMANCE:** No filters on the floating artwork. See AGENT.md.

**EXIT:** Curious, not yet informed. S2 must inform.

**Required refinement (minimal, no redesign):** the lead currently ends
"...with emotion, voice, movement and presence." Four abstract nouns do not
establish the category. Replace that second sentence with the category sentence
from section 1 of this document. Same length, same layout, same type ramp.

**What is strong:** the artwork/type layering, the gradient word, the DNA
integration, "Don't text. Arrive." as the opening bold.

**What is missing:** the word *messaging*; any indication this is for you and
your friends; a meaningful secondary action.

---

### S2 — THE FLAT -> THE ARRIVAL *(built — Phase 1)*

**PURPOSE:** Contrast, then revelation. This is where the product is understood.

**USER QUESTION:** "What actually makes this different from my messages app?"

**CORE MESSAGE:** Text is flat; Knocka arrives.

**VISUAL:** A grey, lifeless text thread on an opaque plate that hides the DNA
field entirely. The thread is pulled into a single point, the plate lifts, the
particles flood back, and the avatar opens out of that same point and knocks
twice.

**CONTENT (temporary, not client-approved):** two display lines, `Text is flat.`
and `Someone just showed up.`, plus a closer, `That's the difference.` The thread
is five messages: hey / hey / what's up? / nothing much / lol, then `Seen 2h ago`.
Copy lives in `site-config.ts` and is marked temporary there.

**SCROLL ARCHITECTURE (as built):** a 240vh runway holding a `position: sticky`
stage, the same shape as Rooms. `useScroll({ offset: ["start start", "end end"] })`
maps the pinned distance to 0->1, routed through one identity `useTransform`
before any range transform (the WAAPI trap — see AGENT.md). A **second**
`useScroll` on the same ref with `offset: ["start end", "start start"]` covers
the approach and multiplies the plate, so it dims in rather than arriving as a
band. The whole timeline lives in one file, `Arrival/score.ts`.

**FINAL VISUAL SEQUENCE (measured):**

| Progress | Beat | State |
|---|---|---|
| 0.02–0.19 | Bubbles stagger in, one at a time | plate opaque, no DNA |
| 0.20–0.27 | Thread stalls. `Seen 2h ago` | |
| 0.22–0.31 | `Text is flat.` rises | |
| 0.40–0.58 | Thread collapses to a point | one `scale` on the wrapper |
| 0.50–0.67 | **Plate lifts.** DNA and colour return | one opacity |
| 0.50–0.67 | Spark at the collapse point | bridges collapse and frame |
| 0.58–0.76 | Frame opens out of the point | |
| 0.70–0.81 | `Someone just showed up.` | |
| 0.84 | **Two knocks**, 0.34s apart | armed by scroll, timed by clock |
| 0.90–0.97 | `That's the difference.` | the breath before S3 |

**THE TWO KNOCKS:** scroll *arms* the sequence, `KNOCK_BEATS` *performs* it, so
the rhythm is identical no matter how fast the visitor scrolls. Two marks land
on the frame's corners with an edge flash and a frame kick on the same impulse
track. Arm and disarm thresholds are 0.84 / 0.66 — hysteresis, so a scroll
resting on the boundary cannot retrigger it. Verified: exactly two marks,
exactly two flashes, gap 332–357ms, replayable, never three.

**ASSET / VIDEO DECISION: still open (client question 1).** The section is
built around a media *slot*, not an asset. The frame is authored at the welcome
video's own 4:3 (1440x1080) and `ArrivalMedia` already implements the video path
(lazy `src`, muted, `playsInline`, no loop, played only on the arrival beat), so
approving it is a one-object change to `arrivalMedia` in `site-config.ts` — no
markup, CSS or timing changes.

**RESOLVED (Phase 6).** The client asked for the welcome video here, with
sound. It is in, and `KNOCK_BEATS` was retimed to its own knock frames exactly
as this paragraph instructed. Two corrections to what was assumed above: the
video is **1440x1440, not 1440x1080**, so the frame's ratio now comes from the
media config rather than being hard-coded; and its audio carries **six** knock
transients, so the two marks ride the first two rather than counting for it.
Unmuted autoplay needs a user gesture, so playback degrades to muted with a
"Hear the knock" control — see LANDING_PAGE_AGENT.md, Phase 6.

**DESKTOP:** Pinned stage, centred and symmetrical — deliberately not the hero's
asymmetric composition, so the collapse reads. Thread and frame share one grid
cell, which is what makes the collapse point and the arrival point the same
point with no measurement.

**MOBILE — deviation from the original plan, recorded deliberately.** The plan
said "not pinned, three normal-scroll beats". Built pinned but shorter: 210vh
under 900px, 190vh under 560px. **Reason:** the collapse is a *transition*
between two states in one place, not a state of its own; as three separate
`whileInView` reveals it has nowhere to live, and it is the hinge of the whole
section. Everything else is reduced instead — shorter pin, smaller frame,
narrower thread. Verified identical beat progression at 390px and 320x568.

**PERFORMANCE (measured, headless, `--disable-gpu`):** DNA canvas at **60fps at
every beat** — flat thread, collapse, plate lift, arrival, both knocks, hold —
and **60.3fps scrubbing the entire runway end to end**. Hero control 60fps,
Rooms control 60fps. No filter on any moving layer: the bloom and spark are
painted radial gradients, not blurs, and the grey is authored, never
`filter: grayscale()`.

**ACCESSIBILITY:** reduced motion (and no-JS, via `@media (scripting: none)`)
drops the pin entirely — the stage goes static, the plate is not rendered, and
the thread and the arrival un-stack into a column with every beat visible at
once. Verified: 120vh, both headline lines, all five bubbles, both knock marks,
the closer, no overflow.

**MEASURED:** 240vh desktop / 190vh mobile (budget: <= 260vh). No horizontal
overflow at 320/375/390/768/1024/1280/1440/1920.

**EXIT:** The visitor now understands the product. Everything after this is proof.

**Why this is uniquely Knocka:** the site's own DNA canvas dies and comes back.
No competitor can copy this, because no competitor has that canvas.

---

### S3 — THE RANGE *(built — Phase 2, on the fallback path)*

**PURPOSE:** Capability proof, without a feature grid.

**USER QUESTION:** "What can it actually do?"

**CORE MESSAGE:** Your face, your voice, your knock.

#### Assets actually available — audited, Phase 2

The whole repository holds **seven** media files, and the working tree and
the entire git history were both checked:

| Asset | Status |
|---|---|
| `branding/knocka-avatar-logo.png` | 615x512, **one avatar in one pose** |
| `branding/knocka-logo.svg` (+ `.original.svg`) | wordmark |
| `videos/Knocka-Welcome-Dark-optimized.mp4` | S2's slot, client-blocked |
| `videos/{coffee-shop,disco-club,ice-cream-shop}.mp4` | S4 |

**There are no expression clips, no expression stills, no lip-sync footage
and no audio of any kind — and there never have been.** Nothing was ever
committed and later removed.

**So S3 ships the FALLBACK PATH, deliberately.** With one pose available, any
design promising an avatar that pulls a face would be a promise we cannot
keep. The avatar is therefore held constant — which is what the spec always
said it should be — and the three modes are argued in type, in one drawn
waveform, and in the two knock marks.

#### Final composition

One avatar held still on the left, and **one hairline spine** running down
through three states on the right, a node on the spine at each. The spine is
the device that stops these being three cards: it makes them one continuous
argument, and it carries the brand gradient purple -> magenta -> cyan on its
way down, so the section reads as Knocka without a single glow. It is a
static CSS gradient — no JavaScript, no animation.

**CONTENT (as specified, unchanged):**

- `01 EXPRESSION` — "Your face, not an emoji." *(the avatar is its visual)*
- `02 VOICE` — "Say it out loud." *(one drawn waveform)*
- `03 THE KNOCK` — "When words are not enough, knock." *(two knock marks)*

Eyebrow `The range`; headline `Your face. Your voice. / Your knock.` The
density rises as you descend — line, then line plus waveform, then line plus
two marks — which is the section's crescendo from calm to knock.

**The waveform is drawn, never recorded.** There is no audio in this project,
so it carries no transport controls, no duration and no scrubber, and it does
not move once it has drawn. A waveform that kept moving would imply audio
that does not exist. The shape is generated deterministically from three sine
terms under one envelope, so the server and the client agree.

**INTERACTION:** Normal scrolling, and genuinely not pinned — no `sticky`, no
`useScroll`, no scroll-linked value anywhere in the section. Every animation
is a one-shot `whileInView` reveal that runs once and stops. Verified: S3
creates no scroll container at any width.

**THE KNOCK:** `KNOCK_BEATS` is imported from S2 rather than redeclared, so
the gap between the two hits cannot drift between the two sections. S2 arms
its knock from scroll progress because it is pinned; S3 arms from `useInView`
because it is not — but in both the rhythm is a clock. Measured across an 18x
range of scroll speeds (5, 14 and 90 px/frame): gap 332ms, 333ms, 349ms.
Exactly two marks, at every width.

**MOTION:** Category C (scroll-triggered) only. Category D (hover) was
specified but not used — there is nothing here worth hovering, and a hover
affordance that does nothing on touch is worse than none.

**DESKTOP (>= 901px):** Avatar left (38%), spine and states right, head
left-aligned. The page now alternates: hero left, S2 centred, S3 left,
Rooms centred.

**MOBILE (<= 900px):** A recomposition, not a squeeze. Head centres, the
avatar sits on top at a size that still reads, and the spine runs straight
down the three states beneath it — same order, same argument, one column.

**PERFORMANCE:** The cheapest section on the page, as intended. No video, no
canvas, no filter, no continuous animation, one `IntersectionObserver` for
the knock. DNA canvas measured at **60fps** at the head, at the waveform, at
the knock, and while scrubbing the section end to end. S3's avatar is the
same optimised URL the hero already loads, so it adds **no** network cost.

**MEASURED:** 97–124vh across 320–1920 (target was ~140vh). No horizontal
overflow at 320/375/390/768/1024/1280/1440/1920.

**ACCESSIBILITY:** Reduced motion keeps every reveal as a short fade with no
travel, the waveform already drawn and both knock marks already landed.
Verified: all three states, both headline lines, the avatar and both marks
visible with no transform applied. No-JS is covered by
`@media (scripting: none)` in `range.css`.

#### Known limitations

1. **The avatar does not change between the three states**, because we have
   one pose. This is the fallback working as designed, not an oversight.
2. **The waveform is decorative.** It is not audio, and must never be given
   playback affordances unless real voice assets and a real player arrive.
3. **The avatar now appears in three sections** (hero, S2, S3). The asset map
   warns that repetition costs it its power; each use is framed differently
   (tilted and glowing in the hero, small inside a 4:3 frame in S2, plain and
   ringed here), but this is the strongest argument for supplying real
   expression assets.

**UPGRADE PATH (client question 4).** If 3 short clips or 6 expression stills
arrive, `01 EXPRESSION` becomes an `AnimatePresence` crossfade in place of the
single image, and nothing else in the section has to change — the spine, the
copy, the waveform and the knock are all independent of it.

**EXIT:** The visitor knows what the product does. Now show them where it lives.

---

### S4 — ROOMS *(built, and polished in Phase 3)*

**PURPOSE:** Social world. Move from "a tool" to "a place".

**USER QUESTION:** "What do I actually do with my friends?"

**CORE MESSAGE:** Your avatar does not just send messages. You can hang out.

**VISUAL:** A pinned cinematic portal; three worlds stacked in Z; scroll flies
the camera forward through them.

**CONTENT:** `01 Coffee shop / Slow conversations.` `02 Disco club / Turn the
moment up.` `03 Ice cream shop / Just hanging out.` Intro lead shortened in
Phase 3 to a single sentence — its first sentence only restated the headline.

**TRANSITION APPROACH — unchanged, deliberately.** The depth stack was kept
exactly as built: outgoing worlds paint above incoming ones so the one you
leave passes the lens while the next scales up from behind. Nothing about the
technique needed replacing; what it needed was pacing.

#### Phase 3 changes

**1. Height — the main one.** Runway 340vh -> **220vh** desktop, 300vh ->
**215vh** at 900px and below; intro padding trimmed. The section went
**392vh -> 297vh** desktop (274–298vh across 320–1920), inside the 300vh hard
cap at every width. The page went 934vh -> **839vh**. The band per world is
now 40vh instead of 80vh, so a crossfade takes about an eighth of a viewport
instead of a quarter: the camera moves through the rooms rather than
dissolving between them.

**2. Closing payoff — "Same friends. Different worlds."** The runway used to
end on silence, which left the three worlds as scenery rather than an
argument. It sits *after* the pinned stage on normal scroll, under a thin rule
that echoes the progress track, at about half the section headline's size —
a landing, not a fifth headline. This is the strategy's core message said
sharply; the core message itself stays as the section's stated idea.

**3. Video loading, staged.** Arming the section used to put all three videos
on the wire in the same instant. The first world still preloads in full; the
other two hold at `metadata` until the visitor is actually in the section.
Measured at the arming moment: **~6.2MB -> ~2.5MB** (coffee 1568KB full, disco
494KB, ice cream 483KB). Both finish during the first world — all three are at
`readyState` 4 at every stop of the walk, so nothing is starved.

**4. Two-decode window shortened.** `WARM_AT` 0.72 -> **0.82**, which cuts the
window where two videos decode from 13% of a band to **3%** — measured as
5 sampled progress points down to 1. See performance below.

**5. Room 03 breaking frame — evaluated and rejected, with numbers.** The
portal sits 23px above the caption. Reaching full-bleed width at 1440 needs
`scale(1.207)`, which grows the frame 54px past each edge and drives it 31px
*into* the caption; the largest collision-free scale is 1.088, which is not a
frame break, just a slightly bigger frame. Doing it properly would mean either
hiding the room label at the payoff moment or counter-translating the caption.
The strategy's own caveat says don't do it if it cannot be done cleanly on
transform and opacity, so it was not done. **Do not revisit without moving the
caption out of the portal's growth path first.**

**PROGRESS INDICATOR:** Unchanged. Ordinals joined by scroll-linked rules
already read as a chapter marker rather than carousel dots, and the brief for
the phase said not to replace what works.

**DESKTOP / MOBILE:** Pin preserved at every width — the mobile sticky
implementation is reliable and the depth stack is the section's whole idea, so
it was shortened rather than unstacked. 2.29:1 above 900px, 16:9 to 560px,
4:3 below. Caption fits inside the stage at all eight test widths.

**PERFORMANCE (measured, headless, `--disable-gpu` = software decode):**

| Point | DNA canvas |
|---|---|
| Room 01 pinned | 60fps |
| Room 02 pinned | 56.7fps *(disco is the largest file at 2.66MB)* |
| Room 03 pinned | 60.3fps |
| Payoff | 60fps |
| Runway scrubbed end to end | 60fps |
| **Inside the two-decode window** | **~30fps** |

**Be honest about that last row.** `WARM_AT` shortened the window's *duration*
by about three quarters; it did not change its *depth*, because the depth is
simply the cost of two simultaneous software decodes. It is now roughly 3% of
a band — about 11px of scroll — and it is the only point on the page under
50fps. Verified that no *dominant* world is ever frozen: the still frame only
ever shows at 46% opacity or less, on a layer that is still scaling.
This is a software-decode worst case; re-measure on real hardware with GPU
decode before spending anything else on it.

**ACCESSIBILITY:** Reduced motion drops every transform — verified `none` on
all three worlds at three scroll positions — and leaves a plain opacity
crossfade with no scrim elements rendered at all. All three rooms, their
captions, the progress states and the payoff are reachable and readable.

**EXIT:** The visitor wants in.

---

### S5 — MODES

**PURPOSE:** Signal ambition. A breath before the ask.

**USER QUESTION:** "Is this just one thing, or is it growing?"

**CORE MESSAGE:** More worlds are coming.

**VISUAL:** Typography only. Three named modes with one line each.

**CONTENT:** Couples / Gaming / Creator — **each explicitly labelled as coming
later.** A section eyebrow such as "On the way" is not optional; it is what keeps
the page honest.

**INTERACTION:** Normal scroll, single reveal.

**MOTION:** Category C only.

**ASSET:** None. No video, no avatar.

**DESKTOP:** Horizontal type strip, or a three-column type block.

**MOBILE:** Vertical list.

**PERFORMANCE:** Effectively free.

**EXIT:** Calm, warmed up, ready for the ask. **Target under 60vh.**

This is the section to cut first if the page runs long.

---

### S6 — THE INVITE

**PURPOSE:** Conversion. The page currently has CTAs that point nowhere.

**USER QUESTION:** "How do I get it?"

**CORE MESSAGE:** Don't text. Arrive.

**VISUAL:** Full-bleed, DNA at full strength, one oversized line, one input, one
button. The quietest layout on the page carrying the loudest type.

**CONTENT:** Headline, one supporting line, email field, CTA, availability note.

**INTERACTION:** Normal scroll, reveal on view.

**MOTION:** Category C + D.

**ASSET:** DNA canvas only. Optionally the avatar making eye contact one last
time, if it does not repeat the hero too closely.

**DESKTOP / MOBILE:** Same composition; on mobile the field and button stack and
the form sits high in the section.

**PERFORMANCE:** No video. This section must never be the reason the page is slow.

**EXIT:** Signed up, or at least clear on what they would be signing up for.

**Blocking issue — there is no backend.** No API route, no server action, no
`.env`. A form that silently does nothing is worse than no form. Options, in
order of preference:

1. Client provides an endpoint (Formspree, Resend, Loops, Beehiiv, or an
   internal API) and we POST to it.
2. Ship the section with the CTA linking to an existing external waitlist form.
3. Ship the layout with the field disabled and a "waitlist opening soon" note.

Pick one before Phase 5 starts. Do not build a fake input.

**App availability:** the footer currently shows App Store and Google Play badges
while every CTA says "Join the Waitlist". One of those is false. If the app is
pre-launch, relabel the badges ("Coming soon to iOS and Android") and keep them
visually. Do not present downloads as available.

---

### FOOTER *(built — role only)*

Site floor and navigation of last resort. Oversized cropped wordmark, four link
columns, app badges, back-to-top. Its only required change is the **availability
labelling** above. Do not redesign it in this phase.

---

## 7. Asset map

| Asset | Section | Notes |
|---|---|---|
| `branding/knocka-logo.svg` | Header, Footer | 55KB optimized. Original kept as `.original.svg` |
| `branding/knocka-avatar-logo.png` | S1 Hero | Also the S3 fallback. Do not reuse at large scale elsewhere — repetition costs it its power |
| `videos/Knocka-Welcome-Dark-optimized.mp4` | **S2 only** | 1440x1080 (4:3), ~5s. Still unused and never requested. S2's frame is authored at its ratio; approving it is a one-object change |
| `videos/Coffee-Shop1.mp4` | S4 room 01 | Built |
| `videos/Disco-Club1.mp4` | S4 room 02 | Built |
| `videos/Ice-Cream-Shop1.mp4` | S4 room 03 | Built |
| DNA canvas | Global, modulated | Full in S1/S6, **hidden then restored in S2**, tinted in S4, quiet in S3/S5 |

**Two video-bearing sections total (S2, S4). That is the ceiling.** Adding a
third requires removing one.

---

## 8. Motion system

**Allowed:** Framer Motion only — `useScroll`, `useTransform`, `useSpring`,
`useInView`, `whileInView`, `AnimatePresence`.

**Forbidden:** GSAP. A second canvas or WebGL. Scroll interception of any kind.
Animating layout properties. Filters (`blur`, `drop-shadow`, `grayscale`) on
anything that moves.

**Prefer:** `transform`, `opacity`. `clip-path` only on small, static-sized
elements, never on a large video layer.

| Category | Sections |
|---|---|
| A — Hero motion | S1 |
| B — Scroll-linked | **S2, S4 only** |
| C — Scroll-triggered | S3, S5, S6, Footer |
| D — Hover / micro | Header, buttons, S3, S6 |
| E — Video transition | S4 |
| F — Section transition | None. Sections meet on the DNA field; no crossfades between them |

**Category C is implemented by two libraries, and the split is not arbitrary.**
AOS drives the simple reveals in the invite banner and the footer; Framer
Motion drives everything else. AOS triggers on an absolute document offset
captured at init, so for elements near the page floor that trigger can land
beyond the furthest the page can scroll and the reveal never runs — measured
at 27px of margin on the footer wordmark before it was corrected. Anything
scroll-linked, pinned, percentage-based or close to the bottom stays on
Framer's IntersectionObserver, which cannot fail that way. See
LANDING_PAGE_AGENT.md, Phase 5.

**Lenis is installed but unused. Recommendation: do not add it now.** Both
scroll-linked sections read `useScroll` progress, and introducing smooth scroll
after S2 is built means re-validating S2, S4, the header densify and the DNA
scroll reaction. Either adopt it before Phase 1, or leave it out permanently.

**Known trap — read AGENT.md before writing S2.** Framer Motion v13 hands
scroll-linked chains to native WAAPI, which throws on input-range stops outside
`[0, 1]` and desyncs from `useScroll` offsets. Rooms works around it with one
identity function transform; S2 must do the same.

---

## 9. Responsive strategy

**Rule: mobile is a recomposition, not a scale-down. The story must be
understandable with animation fully disabled.**

| Section | Desktop | Mobile |
|---|---|---|
| S1 | Asymmetric copy/portal overlap | Portal bleeds off-edge, copy rides up (built) |
| S2 | Pinned 240vh scroll-linked sequence (built) | **Pinned but shorter** — 210vh <=900px, 190vh <=560px (built). See the S2 spec for why the pin was kept |
| S3 | Avatar left (38%), spine and states right (built) | Avatar top, spine and states beneath, head centred (built) |
| S4 | Pinned depth stack, 2.29:1, 220vh runway (Phase 3) | Pin kept and shortened to 215vh, 4:3 crop. The depth stack is the section's idea; unstacking it would remove the point |
| S5 | Horizontal type strip | Vertical list |
| S6 | Full-bleed, inline form | Full-bleed, stacked form, larger tap targets |

Mobile reduces: pinning, parallax, simultaneous video decode, particle density,
transition complexity.

---

## 10. Performance budget

**The DNA canvas is the canary. Measure its frame rate per section. Sustained
below 50fps is a regression that blocks the phase.**

Current measured baseline: **60fps** while a room is pinned, **~33fps** during a
Rooms crossfade (two videos decoding, measured under software decode in headless
Chrome — treat as worst case, re-measure on real hardware before optimising).

Hard rules:

- No second canvas, no WebGL
- No filters on moving elements (a single `drop-shadow` once cost 60 to 11fps)
- Never animate layout properties
- Videos lazy-armed via `useInView`, never blocking LCP
- Maximum two videos decoding, and only during a transition
- Reduced motion produces a readable static page

### Page length

Measured after Phase 3: **839vh desktop / 763vh mobile**, of which S4 is 297vh,
S2 is 240vh and S3 is 97–124vh. (After Phase 2 it was 934vh; before S2, 586vh.)

**Correction to earlier research:** a 900vh target is not achievable with six
sections and two pinned sequences. The realistic budget is:

| Section | Target (desktop) |
|---|---|
| S1 Hero | ~100vh |
| S2 Arrival | 240vh (built) |
| S3 Range | 97–124vh (built) |
| S4 Rooms | 297vh (built, down from 392) |
| S5 Modes | <= 60vh |
| S6 Invite | ~90vh |
| Footer | ~100vh |
| **Total** | **<= 1040vh** |

**Hard cap: no single section over 300vh.**

---

## 11. Navigation decisions

Current nav: `Flow & Motivi (#how)`, `Features (#features)`, `Modes (#modes)`,
`FAQ (#faq)`. **Three of four anchors do not exist**, and `#modes` currently
points at Rooms.

| Item | Problem | Recommendation | Status |
|---|---|---|---|
| "Flow & Motivi" | Unclear, almost certainly a placeholder or typo. Means nothing to a visitor | Rename to **"How it works"**, pointing at `#arrival` (S2) | Link **live since Phase 1** (S2 exists). **Label still needs client confirmation** |
| "Features" | Anchor now exists (S3, Phase 2) | Point at S3 (`#range`). Consider renaming to "What it does" | **Link still hidden.** Phase 2 was told not to modify navigation, and the label has its own pending rename — flipping `ready` is a one-line change when both are cleared |
| "Modes" | Points at Rooms, which is not Modes | Re-point to S5 (`#modes`); give Rooms `#rooms` | **Done (Phase 0)** |
| "FAQ" | Anchor does not exist; conflicts with the creative strategy | **Remove.** A pre-launch social app with no pricing has no FAQ worth reading | **Client confirmation** — entry retained, link hidden (Phase 0) |
| "Rooms" | Not in nav, though it is the best section | Add as a nav item | **Done (Phase 0)** |
| "Glass Matrix" | Unexplained secondary CTA in prime header space | Remove, or replace with **"See how it works"** scrolling to S2 | **Client confirmation** — untouched |

**Phase 0 mechanism:** `navLinks` in `site-config.ts` holds every intended item
with a `ready` flag; only `activeNavLinks` renders. No label was renamed or
deleted, and no dead link ships. Each later phase flips one flag.

**Proposed final nav (4 items):** How it works, What it does, Rooms, Modes.
Four is the maximum before the header starts collapsing at common widths.

---

## 12. Open client questions

Ordered by how much work each one blocks. **Phases 0, 1 and 2 resolved none of
these** — each built around the open question rather than answering it.
Question 6 ("Flow & Motivi") is now visible in the header, because the section
it points at exists. Question 7's sibling — whether "Features" is renamed —
now also gates whether S3 appears in the navigation at all.

1. ~~**Is the welcome video banned everywhere, or only in the hero?**~~
   **ANSWERED (Phase 6):** it belongs in S2's frame, with sound. The hero is
   still without it. Nothing here is open any more.
2. **Waitlist or download?** The page currently says both. Blocks Phase 5 and
   the footer fix.
3. **Is there an email endpoint for the waitlist?** No backend exists today.
   Blocks Phase 5.
4. **Can we get avatar expression assets** (3 short clips or 6 stills)?
   Phase 2 shipped the fallback because the answer is currently "no assets
   exist". This is now the single change that would most improve S3, and the
   upgrade is contained to `01 EXPRESSION`.
5. **What does "Glass Matrix" mean?** If there is no answer, it comes off the page.
6. **Is "Flow & Motivi" intentional?** Confirm before renaming.
7. **Remove FAQ?** Recommended, needs sign-off.
8. **Are Couples / Gaming / Creator confirmed as future-only?** Assumed yes.

---

## 13. Do not build

- Three-column feature card grids
- Testimonials, user counts, logos, or any other invented social proof
- Pricing
- FAQ (unless the client insists)
- More than two knocks **of our own invention**. UPDATED: the client's
  welcome video knocks six times and is now S2's arrival media. The rule was
  written to stop us fabricating a rhythm, and it still does — the page adds
  no knock of its own, and the two marks ride the video's first two real
  hits. Do not add a third mark.
- A phone mockup — meaning an invented device frame around invented UI.
  SUPERSEDED IN PART: the invite banner shows three real app screens supplied
  by the client (public/news-latter-phone-img). They are product screenshots,
  not a mockup, so they are evidence rather than decoration. The rule still
  stands for anything we would have to draw ourselves.
- A video gallery, or any fourth video
- A second canvas or particle system
- Horizontal scroll anywhere
- More than two pinned sections
- Any section over 300vh
- A non-functional email input — still holds. The invite banner ships one
  headline, one CTA and an availability note, with no field, because there is
  still no endpoint.
- "Download now" while the product is pre-launch
- Section-to-section crossfades — the DNA field is the transition
- Repetitive fade-up on every element

---

# IMPLEMENTATION PLAN

**Execution rule:** one phase at a time. Read `LANDING_PAGE_AGENT.md`, then this
document, then only the files the phase touches. Implement, validate, update both
documents if any decision or state changed, then stop. Never run ahead into a
later phase without being asked.

---

## PHASE 0 — Product and content decisions

**GOAL:** Unblock everything. No new sections.

**FILES LIKELY AFFECTED:** `src/lib/site-config.ts`,
`src/components/sections/Hero/Hero.tsx` (one line),
`src/components/sections/Rooms/Rooms.tsx` (anchor),
`src/components/sections/Footer/Footer.tsx` (badge labels).

**DEPENDENCIES:** Client answers to questions 1, 2, 5, 6, 7.

**IMPLEMENTATION NOTES:** Nav labels and anchors per section 11. Hero lead
rewrite per S1. Rooms `id="modes"` becomes `id="rooms"`. Footer badges relabelled
if pre-launch. Build no new section in this phase.

**VALIDATION:** Every nav item scrolls to a real element. `tsc`, `eslint`, build.
No visual regression in the hero beyond the intended copy line.

**DONE WHEN:** No dead anchors, no unexplained CTA, no false availability claim.

---

## PHASE 1 — S2 The Flat -> The Arrival — **DONE**

**GOAL:** The page's comprehension moment.

**FILES CHANGED:** `src/components/sections/Arrival/{Arrival,ConversationThread,ArrivalMedia}.tsx`,
`score.ts`, `index.ts` (new), `src/styles/arrival.css` (new),
`src/app/globals.css` (one import), `src/app/page.tsx` (one section),
`src/lib/site-config.ts` (thread copy, media slot, one nav flag).

**DEPENDENCIES:** Phase 0. Client question 1.

**IMPLEMENTATION NOTES:** Pinned runway plus sticky stage, same architecture as
Rooms. **Route scroll progress through one identity `useTransform` before any
range transform** — see the WAAPI trap in AGENT.md. Grey bubbles authored grey,
never filtered. Scrim is one solid div animating opacity only. Video lazy-armed
with `useInView` and played only while in view. Mobile: no pin, three
normal-scroll beats.

**VALIDATION — all met.** DNA 60fps at every beat and while scrubbing (target
>= 50). No horizontal overflow at 320–1920. Reduced motion shows all beats
statically with the pin dropped. Section 240vh desktop / 190vh mobile
(budget <= 260vh). Hero, Rooms, header and footer verified unchanged.

**CLOSED (Phase 6):** client question 1 answered — the welcome video is now
S2's arrival media, with sound.

---

## PHASE 2 — S3 The Range — **DONE**

**GOAL:** Capability proof without a feature grid.

**FILES CHANGED:** `src/components/sections/Range/{Range,VoiceWave,KnockMarks}.tsx`,
`index.ts` (new), `src/styles/range.css` (new), `src/app/globals.css` (one
import), `src/app/page.tsx` (one section). **`site-config.ts` was not
touched** — S3's copy is three distinct compositions, not a data collection,
so it lives in the component.

**DEPENDENCIES:** Phase 1. Client question 4 determines primary vs fallback.

**IMPLEMENTATION NOTES:** Normal scroll, `whileInView` only. **Not pinned.** If
assets arrive, swap avatar visuals with `AnimatePresence`. Otherwise ship the
static avatar plus typography plus inline SVG waveform fallback.

**VALIDATION — all met.** No video, no canvas, no new dependency. DNA 60fps at
every point in the section and while scrubbing it. Readable with motion off.
No horizontal overflow at 320–1920. No scroll container. Exactly two knock
marks. S2 re-walked at 11 stops and Rooms at 7 — both byte-identical; hero and
footer verified unchanged.

**STILL OPEN:** client question 4 (expression assets) and the `#range` nav flag.

---

## PHASE 3 — S4 Rooms polish — **DONE**

**GOAL:** Finish the built section.

**FILES CHANGED:** `src/components/sections/Rooms/Rooms.tsx` (lead, payoff,
`WARM_AT`, staged preload wiring), `RoomScene.tsx` (`isEager`),
`src/styles/rooms.css` (heights, payoff). Plus one line in
`Hero/Hero.tsx` — see S1; the owner removed the hero artwork mid-phase and
the orphaned import broke the build.

**DEPENDENCIES:** Phase 1 (the height budget depends on S2 existing).

**IMPLEMENTATION NOTES:** The anchor is already fixed in Phase 0. Add the closing
payoff line after room 03. Reduce the runway from 340vh to ~250vh (section
~290vh). Evaluate room 03 breaking frame **only** if achievable on transform and
opacity. Re-verify lazy arming and single-decode behaviour after the height
change.

**VALIDATION — met, with one measured exception.** Runway re-walked at 7 stops
at 1440 and 390: opacities still reach a clean 1 and 0, one decoder outside the
crossfade, all videos `readyState` 4. No overflow and no nested scroll container
at 320–1920. Section 274–298vh, under the 300vh cap everywhere. DNA >= 56fps
everywhere **except** the ~3%-of-a-band two-decode window, which measures 30fps
under software decode — see the S4 performance table. S2 re-walked at 11 stops
and S3 at 8 widths: both identical to their baselines.

---

## PHASE 4 — S5 Modes

**GOAL:** A quiet, future-facing beat.

**FILES LIKELY AFFECTED:** `src/components/sections/Modes/*` (new),
`src/styles/modes.css` (new), `src/app/globals.css`, `src/app/page.tsx`,
`src/lib/site-config.ts`.

**DEPENDENCIES:** Phase 3. Client question 8.

**IMPLEMENTATION NOTES:** Typography only. No video, no pinning, no parallax.
Every mode explicitly labelled as coming later.

**VALIDATION:** Under 60vh. Negligible fps impact.

**DONE WHEN:** Ambition is signalled without implying availability.

---

## PHASE 5 — S6 The Invite

**GOAL:** Conversion.

**FILES LIKELY AFFECTED:** `src/components/sections/Invite/*` (new),
`src/styles/invite.css` (new), `src/app/globals.css`, `src/app/page.tsx`,
possibly `src/app/api/waitlist/route.ts`,
`src/components/sections/Footer/Footer.tsx`.

**DEPENDENCIES:** Phase 4. Client questions 2 and 3 — **hard blockers.**

**IMPLEMENTATION NOTES:** Do not build a non-functional input. Pick one of the
three options in the S6 spec. Availability messaging must agree with the footer.
Full-bleed, DNA at full strength, no video.

**VALIDATION:** The form either submits or is honestly disabled. Keyboard
reachable, label associated, visible focus, error and success states. Reduced
motion clean.

**DONE WHEN:** A visitor can act, and nothing on the page over-claims.

---

## PHASE 6 — Global QA

**GOAL:** Ship quality.

**FILES LIKELY AFFECTED:** Fixes only.

**DEPENDENCIES:** Phases 0–5.

**IMPLEMENTATION NOTES:** Full sweep at 320 / 375 / 390 / 768 / 1024 / 1280 /
1440 / 1920. Reduced motion end to end. Keyboard traversal of the whole page
including the mobile menu and the form. Video load behaviour on a cold cache.
DNA fps sampled per section. Total page height against the section 10 budget.

**VALIDATION:** `tsc --noEmit`, `eslint`, and the production build all clean. No
horizontal overflow at any width. No section over 300vh. Total <= 1040vh.

**DONE WHEN:** Every number in section 10 is met, and both documents reflect
reality.

---

## Corrections applied to earlier research

Recorded so they are not reintroduced.

1. **Page target 900vh becomes ~1040vh.** 900 was asserted, not measured, and is
   not achievable with six sections and two pinned sequences.
2. **Rooms is 392vh, not 340vh.** 340vh is the runway; the section also includes
   its intro block.
3. **Conversion percentages removed.** Figures such as "60% never scroll" and
   "+12% from social proof" came from marketing-blog aggregations rather than
   primary research. The underlying principle — above-the-fold clarity matters
   more than ornament — stands on its own as a design inference and needs no
   number attached.
4. **"5–7 sections" was an inference, not a sourced fact.** Labelled as such.
5. **Room 03 full-bleed downgraded** from a recommendation to an option carrying
   a layout-animation caveat.
6. **S6 "real email capture" was assumed possible.** There is no backend; this is
   now an explicit blocker with three defined fallbacks.
7. **Lenis moved from "decide separately" to "do not add now"**, with the reason
   recorded.

### Evidence classification

- **Confirmed fact (measured in this repo):** page and section heights; 60fps
  pinned and ~33fps during a Rooms crossfade; no backend or `.env`; three of four
  nav anchors missing; `Knocka-Welcome-Dark-optimized.mp4` unused; the WAAPI
  acceleration trap.
- **Inference (reasoned, not measured):** section count and ordering; the
  emotional arc; pacing rhythm; that the hero fails the 20-second clarity test.
- **Design recommendation:** every section specification in part 6.
- **Client decision required:** everything in part 12.
