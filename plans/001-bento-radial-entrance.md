# 001 — Add radial converge-in entrance animation to the bento grid

- **Status**: DONE (implemented and verified in-browser at the `lg` breakpoint;
  see "Verification results" at the end of this file)
- **Commit**: 39b9496
- **Severity**: MEDIUM (missed opportunity — additive, not corrective)
- **Category**: Missed opportunities / Purpose & frequency
- **Estimated scope**: 1 file (`src/components/bento-grid.tsx`), ~40 lines added

## Problem

The bento grid currently has **no entrance animation**. Every tile is painted at
its final position the instant it renders, while the hero section directly above
it animates in with a deliberate, blurred expo-out entrance
(`src/app/page.tsx:36-40`). The result is a tonal break: a crafted hero followed
by a grid that simply pops into existence.

Current markup — all six tiles are plain, static `<div>`s:

```tsx
/* src/components/bento-grid.tsx:43-48 — current */
    <section className="w-full flex justify-center">
      <div className="w-full max-w-275 grid grid-cols-1 grid-flow-dense sm:grid-cols-2 lg:grid-cols-8 mt-10">
        <div
          id="project-1"
          className="p-3 aspect-square sm:col-span-2 sm:aspect-2/1 lg:col-span-4"
        >
```

```tsx
/* src/components/bento-grid.tsx:144-147 — current */
        <div
          id="me"
          className="p-3 aspect-square  sm:col-span-2 sm:aspect-5/3 lg:col-span-3"
        >
```

At the `lg` breakpoint the six tiles form a ring around a hub. Measured on the
live page at a 1440px viewport (grid box 1100×688), each tile's centre offset
from the grid's centre:

| Tile (`id`) | Offset from centre | Distance | Screen angle | Direction |
| --- | --- | --- | --- | --- |
| `project-1` (Quiro) | −275, −206 | 344px | 217° | up-left |
| `project-2` (Keipy) | +138, −206 | 248px | 304° | up-right |
| `project-3` (Ekkelesia) | +413, 0 | 413px | 0° | right |
| `tech stack` | −137, +261 | 295px | 118° | down (slightly left) |
| `thoughts` | −344, +55 | 348px | 171° | left |
| **`me` (About Me)** | **+69, +55** | **88px** | — | **the hub** |

`me` sits at 88px from centre while the next-closest tile is 248px away, so it is
unambiguously the centre of the ring. This radial structure is currently
invisible to the user — nothing in the motion communicates it.

## Target

Each of the five **ring** tiles starts displaced **outward** along its own radial
unit vector and converges inward to its resting position. The **hub** tile (`me`)
does not travel at all — opacity only. The ring resolves clockwise starting from
the right, after the hub has begun fading in.

Exact per-tile values. Travel distance is a **flat 28px** along each tile's
normalised radial vector (values below are pre-computed — use them verbatim, do
not recompute):

> **Revised after first implementation** — travel reduced from 28px to 16px and a
> blur rack added, at the author's request ("more subtle and cinematic"). The
> table below is the current, shipped spec.

| Order | Tile (`id`) | `hidden` x | `hidden` y | `delay` (s) |
| --- | --- | --- | --- | --- |
| 1 | `me` | — (no travel) | — | `0` |
| 2 | `project-3` | `16` | `0` | `0.13` |
| 3 | `tech stack` | `-7` | `14` | `0.195` |
| 4 | `thoughts` | `-16` | `3` | `0.26` |
| 5 | `project-1` | `-13` | `-10` | `0.325` |
| 6 | `project-2` | `9` | `-13` | `0.39` |

Shared motion values:

```ts
/* target */
const EASE = [0.16, 1, 0.3, 1] as const; // expo-out — same curve as the hero
const RING_DURATION = 0.75;              // seconds
const HUB_DURATION  = 0.55;              // seconds
const ENTER_BLUR    = "blur(4px)";       // rack-focus; resolves to blur(0px)
// Stagger between ring tiles: 65ms
// Total sequence length: 0.39 (last delay) + 0.75 = 1.14s
```

Every tile (hub included) also racks from `blur(4px)` to sharp over its own
duration. Because the travel is short, the blur — not the distance — is what
carries the entrance. The `visible` variant must additionally carry
`transitionEnd: { filter: "none" }`: a settled `blur(0px)` is visually a no-op
but still forces a stacking context and its own compositing layer, which can
soften text antialiasing permanently. Reduced motion gets neither travel nor
blur — opacity only.

Trigger — fires when the grid enters the viewport and **replays every time it
re-enters**:

```tsx
/* target — on the grid container */
initial="hidden"
whileInView="visible"
viewport={{ once: false, amount: 0.15 }}
```

Reduced motion — movement dropped, opacity retained:

```ts
/* target — when useReducedMotion() returns true */
hidden:  { opacity: 0 }
visible: { opacity: 1, transition: { duration: 0.3, ease: EASE } }
```

## Repo conventions to follow

- **Motion library**: `motion/react` (already a dependency). Import as
  `import { motion, useReducedMotion } from "motion/react";`
- **Easing**: the codebase's established entrance curve is
  `ease: [0.16, 1, 0.3, 1]`. **Exemplar to imitate — `src/app/page.tsx:36-40`:**

  ```tsx
  <motion.section
    initial={{ opacity: 0, y: -18, scale: 0.98, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
  ```

  Do **not** invent a different curve. Do **not** add `blur` or `scale` to the
  grid tiles — the hero owns that treatment; the grid's identity is the radial
  translate.
- **Client boundary**: `src/components/bento-grid.tsx` has no `"use client"`
  directive but is imported by `src/app/page.tsx`, which does (`page.tsx:1`), so
  it already compiles into the client graph. Add an explicit `"use client";` as
  the first line anyway — this file is about to use React hooks and the explicit
  directive prevents breakage if it is ever imported from a server component.

## Steps

1. **`src/components/bento-grid.tsx`** — add `"use client";` as the very first
   line of the file, above the existing `import Image from "next/image";`.

2. **`src/components/bento-grid.tsx`** — add the motion import alongside the
   existing imports:

   ```tsx
   import { motion, useReducedMotion } from "motion/react";
   ```

3. **`src/components/bento-grid.tsx`** — after the existing `techStack` array
   (which ends at line 39 with `];`) and before
   `export default function BentoGrid()`, add the motion constants and a variant
   factory:

   ```tsx
   const EASE = [0.16, 1, 0.3, 1] as const;
   const RING_DURATION = 0.6;
   const HUB_DURATION = 0.45;

   // Each ring tile enters from 28px further out along its own radial vector,
   // measured from the grid's centre at the lg breakpoint. The hub (`me`) does
   // not travel — it only fades.
   // ponytail: one fixed offset set for all breakpoints. Below `sm` the grid is
   // a single column so the vectors are no longer truly radial, but at 28px the
   // drift reads as a pleasant organic offset either way. Add a matchMedia
   // branch only if the mobile entrance ever looks wrong.
   const tileMotion = (x: number, y: number, delay: number, reduced: boolean) =>
     reduced
       ? {
           hidden: { opacity: 0 },
           visible: {
             opacity: 1,
             transition: { duration: 0.3, ease: EASE },
           },
         }
       : {
           hidden: { opacity: 0, x, y },
           visible: {
             opacity: 1,
             x: 0,
             y: 0,
             transition: { duration: RING_DURATION, delay, ease: EASE },
           },
         };

   const hubMotion = (reduced: boolean) => ({
     hidden: { opacity: 0 },
     visible: {
       opacity: 1,
       transition: { duration: reduced ? 0.3 : HUB_DURATION, ease: EASE },
     },
   });
   ```

4. **`src/components/bento-grid.tsx`** — inside `BentoGrid()`, immediately after
   the opening brace and before `return (`, add:

   ```tsx
   const reduced = useReducedMotion() ?? false;
   ```

5. **`src/components/bento-grid.tsx`** — convert the grid container (currently
   line 44) from `<div>` to `motion.div` and add the trigger. Keep the
   `className` exactly as it is:

   ```tsx
   <motion.div
     initial="hidden"
     whileInView="visible"
     viewport={{ once: false, amount: 0.15 }}
     className="w-full max-w-275 grid grid-cols-1 grid-flow-dense sm:grid-cols-2 lg:grid-cols-8 mt-10"
   >
   ```

   Its matching closing `</div>` (currently line 191, the one directly before
   `</section>`) becomes `</motion.div>`.

6. **`src/components/bento-grid.tsx`** — convert each of the six tile wrappers
   from `<div id="…">` to `<motion.div id="…" variants={…}>`, keeping every
   existing `id` and `className` byte-for-byte and closing each with
   `</motion.div>`. Apply exactly these variants:

   ```tsx
   /* line 45 — project-1 */
   <motion.div
     id="project-1"
     variants={tileMotion(-22, -17, 0.285, reduced)}
     className="p-3 aspect-square sm:col-span-2 sm:aspect-2/1 lg:col-span-4"
   >

   /* line 72 — project-2 */
   <motion.div
     id="project-2"
     variants={tileMotion(16, -23, 0.34, reduced)}
     className="p-3 aspect-square lg:col-span-2"
   >

   /* line 94 — project-3 */
   <motion.div
     id="project-3"
     variants={tileMotion(28, 0, 0.12, reduced)}
     className="p-3 aspect-square  sm:row-span-3 sm:aspect-2/5 lg:col-span-2"
   >

   /* line 123 — thoughts */
   <motion.div
     id="thoughts"
     variants={tileMotion(-28, 4, 0.23, reduced)}
     className="p-3 aspect-square lg:col-span-3 md:aspect-5/3 md:col-span-2"
   >

   /* line 144 — me (the hub: fade only, no travel) */
   <motion.div
     id="me"
     variants={hubMotion(reduced)}
     className="p-3 aspect-square  sm:col-span-2 sm:aspect-5/3 lg:col-span-3"
   >

   /* line 163 — tech stack */
   <motion.div
     id="tech stack"
     variants={tileMotion(-13, 25, 0.175, reduced)}
     className="p-3 aspect-square  sm:col-span-2 sm:aspect-5/1 lg:col-span-6"
   >
   ```

   Children with a `variants` prop inherit the `hidden`/`visible` state from the
   `motion.div` container in step 5 — do **not** add `initial` / `whileInView` /
   `animate` to the individual tiles. A single trigger must drive all six, or the
   choreography breaks when tiles scroll into view independently.

## Boundaries

- Do NOT touch any file other than `src/components/bento-grid.tsx`.
- Do NOT modify anything **inside** the six tiles — the `<Link>` elements,
  `BentoCardHeader`, `<img>` tags, `TooltipTrigger`/`Button` icon list, and all
  existing `group-hover:` transitions stay exactly as they are.
- Do NOT change any `className`, `id`, or grid/span/aspect utility. Layout must
  be byte-identical; this change is motion-only.
- Do NOT add `scale`, `filter: blur`, or `rotate` to the tiles.
- Do NOT add new dependencies — `motion/react` is already installed.
- Do NOT raise `viewport.amount` above `0.2`. `amount` is the fraction of the
  **element** that must be visible; on mobile the stacked grid is far taller than
  the viewport, so its maximum visible fraction is roughly `viewportHeight /
  gridHeight` (~0.4). An `amount` of `0.5` would mean the animation **never
  fires on mobile at all**.
- If a step doesn't match the code you find (drift since commit `39b9496`), STOP
  and report instead of improvising — especially the line numbers, which shift as
  soon as steps 1–4 add lines.

## Verification

- **Mechanical**:
  - `npx tsc --noEmit` → expect no new errors.
  - `npm run build` → expect a clean production build.
  - Confirm `git diff --stat` touches exactly one file:
    `src/components/bento-grid.tsx`.
- **Feel check**: run `npm run dev`, load `http://localhost:3000` at a 1440×1000
  viewport, and scroll the bento grid into view. Confirm:
  - The **About Me** tile fades in first without moving a pixel — it must not
    translate at all.
  - The other five tiles slide **inward toward the centre**, never outward. The
    Ekkelesia tile (far right) must move leftward; the Tech Stack tile (bottom)
    must move upward.
  - The ring resolves clockwise: Ekkelesia → Tech Stack → Thoughts → Quiro →
    Keipy. Watch it once at normal speed, then confirm the order explicitly in
    DevTools → Animations panel at 10% playback speed.
  - Scroll the grid fully out of view and back — the animation **replays**.
  - Nothing in the layout jumps or reflows: the tiles' final positions are
    identical to before this change. Compare against `git stash` if unsure.
  - In DevTools → Performance, record the entrance and confirm no dropped frames.
    If frames drop, the fix is to swap the `x`/`y` shorthand for a full
    `transform: "translate(28px, 0px)"` → `transform: "translate(0px, 0px)"`
    string, which is composited rather than driven on the main thread.
  - DevTools → Rendering → **Emulate `prefers-reduced-motion: reduce`**, then
    reload and scroll to the grid: all six tiles must fade with **zero
    translation**, over ~0.3s.
  - Resize to 375px wide and scroll to the grid: the animation must still fire
    (see the `amount` warning in Boundaries) and no tile may overflow the
    viewport horizontally during its travel.
- **Done when**: all six tiles animate on viewport entry with the hub fading and
  the ring converging clockwise; the sequence completes in ~0.94s; reduced motion
  drops all translation; layout and hover behaviour are unchanged.

## Verification results

Implemented and checked at viewport `1600x520` (forces the true `lg` layout —
grid measured 1100×688 — while keeping the grid below the fold so the trigger can
be exercised).

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS (exit 0) |
| `motion.div` tags balanced | PASS — 7 open / 7 close (1 container + 6 tiles) |
| Per-tile variant wiring | PASS — all six match the offset/delay table verbatim |
| Hidden state offsets | PASS — `project-1` `(-13,-10)`, `project-2` `(9,-13)`, `project-3` `(16,0)`, `thoughts` `(-16,3)`, `tech stack` `(-7,14)`, all `opacity 0` + `blur(4px)` |
| Hub does not travel | PASS — `me` reports `transform: none` in the hidden state (blur only) |
| Converges to rest | PASS — after entry all six report `opacity 1, transform: none` |
| Blur fully released | PASS — all six settle at `filter: none`, not `blur(0px)`, so no stacking context or compositing layer is left behind |
| Layout unchanged | PASS — final transform is `none` on every tile, so resting positions are identical to pre-change |
| Replay on re-entry (`once: false`) | PASS — scrolling back out restored every tile to its exact hidden offset |
| Console | PASS — clean on a fresh tab |

**Not verified in this environment — needs a manual pass:**

- **`prefers-reduced-motion`.** The branch is implemented (`tileMotion(…, true)`
  returns `hidden: { opacity: 0 }` with no `x`/`y`) and typechecks, and was
  confirmed by code inspection — but it could not be exercised at runtime here:
  Chrome is not installed on this machine so DevTools media emulation was
  unavailable, and the in-app browser pane exposes no rendering-emulation API.
  To check manually: DevTools → Rendering → *Emulate CSS media feature
  prefers-reduced-motion: reduce*, reload, scroll to the grid, and confirm all
  six tiles fade with zero translation.
- **Clockwise stagger order, observed frame-by-frame.** The delays are hard-coded
  literals (`me` 0, `project-3` 0.12, `tech stack` 0.175, `thoughts` 0.23,
  `project-1` 0.285, `project-2` 0.34) and were verified in source, so the order
  is correct by construction — but timer throttling in the automation sandbox
  prevented sampling it live. Confirm by eye at 10% playback in the DevTools
  Animations panel.
- **Frame rate during the entrance.** Not profiled. If frames drop, swap the
  `x`/`y` shorthand for a full `transform` string (see Verification above).
