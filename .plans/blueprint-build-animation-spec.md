# Blueprint build animation: spec

Status: ready to implement · Written 2026-11-06 · Owner: Bruno

## Intent

On every full page load, the page is covered in blueprint paper and the site looks like it is being drafted live. A grid appears, construction lines extend, a macOS-style cursor drag-draws the key boxes, dimensions and labels appear, and then the whole sheet dissolves into the real page. It runs for about 1.6s and any input skips it.

## Decisions (from interview)

| Topic | Decision |
| --- | --- |
| When it plays | **Every full page load** (hard load or refresh). Client-side navigation never replays it: it lives in the root layout, which doesn't remount on route changes. |
| Duration | **About 1.6s, skippable.** Any `pointerdown`, `keydown`, `wheel` or `touchstart` skips straight to the dissolve. There is **no skip hint**. |
| What it draws | **Outline boxes, dimension lines, annotations, construction lines.** |
| Handover | **Whole-page dissolve.** The finished blueprint cross-fades to the real page in one move. |
| Geometry source | **Measured live** from the DOM via `data-blueprint` attributes, so it works on any route and width. |
| Coverage | **Viewport only.** Content below the fold is real from the start. |
| Sound | **Silent.** Autoplay is blocked before a gesture anyway. |
| Dark mode | **Inverted per theme.** See Palette. |
| Before hydration | **Opaque paper as an SSR cover**, so the finished page never flashes first. |
| Reduced motion / no JS | **Skip entirely.** No cover is shown. |
| Extras | **Drafting cursor** and **live coordinate readout** (no title block, no replay control). |
| Mobile | **Fewer labels.** Below 640px, keep outlines, construction lines and the H1 and card labels; drop most dimension and annotation labels. |
| Choreography | **Stages, then elements** (timeline below). |
| Lettering | **Geist Mono, uppercase, tracked.** No extra font. |
| Cursor look | **macOS arrow, inverted:** white fill with a blue-black outline. |
| Cursor behavior | **Drag-to-draw boxes**, **eased travel** between boxes, **fades out with the dissolve**. No selection handles. |
| Targets | **Header and nav pill**, **hero text and buttons**, **product cards** above the fold. The column frame is *not* a target (construction lines come from the element edges instead). |
| Pacing conflict | **The cursor drags only 3 key boxes** (nav pill, H1, feature card) at about 200ms each. All other boxes trace by themselves in parallel ("auto-layout"). |

## Timeline (total about 1.6s)

| t (s) | Stage |
| --- | --- |
| 0.00–0.20 | Paper is already present (SSR). The grid fades in: minor lines every 8px, major every 40px. |
| 0.20–0.50 | Construction lines extend from viewport edge to edge along the de-duplicated x and y edges of every measured box (stroke-dashoffset draw). |
| 0.45–1.20 | Boxes trace in DOM order. The cursor eases to the nav pill, presses (scale 0.9) at its top-left corner, and drags to bottom-right while the rect traces. The H1 and the feature card get the same treatment. The other boxes trace on their own, staggered about 40ms, in the gaps. |
| 1.00–1.35 | Dimension lines and labels appear: opacity 0→1 and translateY 2px→0, staggered about 25ms. |
| 0.00–1.35 | The coordinate readout (bottom-left, e.g. `X 0412  Y 0188`) tracks the cursor every frame and shows the drawing point while boxes self-trace. |
| 1.35–1.60 | Dissolve: the overlay goes from opacity 1 to 0 with `cubic-bezier(0.2, 0, 0, 1)` while the cursor fades with it. Then it unmounts. |

On skip, jump straight to a 200ms dissolve from the current frame.

## Palette

| Token | Light theme | Dark theme |
| --- | --- | --- |
| Paper | `#1f4fa0` (classic blueprint blue) | `#0a1628` (navy) |
| Line (boxes, dimensions) | `rgb(255 255 255 / 0.92)` | `#7dd3fc` (cyan) |
| Grid minor / major | white at 0.10 / 0.22 | cyan at 0.08 / 0.18 |
| Construction lines | white at 0.35, dashed `4 4` | cyan at 0.30, dashed `4 4` |
| Labels | white at 0.85 | cyan at 0.85 |
| Cursor | white fill, `#0b2350` outline, soft shadow | white fill, `#0a1628` outline |

Read the theme from `html.dark` at mount. The inline theme script already runs before paint, so the SSR cover picks the right paper with CSS (`.dark #bp-cover`).

## What gets drawn per target

Tag targets with `data-blueprint="<LABEL>"`. The label is the annotation text.

| Element | Tag | Label shown | Dimension lines | Cursor drags? |
| --- | --- | --- | --- | --- |
| Avatar | `AVATAR` | `AVATAR · 40` | none | no |
| Name block | `NAME` | `NAME` | none | no |
| Nav pill | `NAV` | `NAV · CAPSULE` | width | **yes** |
| H1 | `H1` | `H1 · {computed font-size}PX GEIST` | width + height | **yes** |
| Intro paragraph | `BODY` | `BODY · 15PX` | none | no |
| CTA buttons (×3) | `CTA` | `CTA` (first only) | none | no |
| Feature card image | `IMG` | `IMG · 16:9` | width | **yes** |
| Other visible cards | `IMG` | `IMG · 16:10` | none | no |

- Dimension values are real measured CSS px, rounded (e.g. `640`).
- Dimension lines are architectural: thin lines with tick ends offset 8px outside the box and the value centred on a paper-colored knockout.
- Mobile (<640px): keep only the H1 and IMG labels and drop every dimension line.

## Architecture

### Files
- `src/components/blueprint/blueprint-intro.tsx` (client): measures, renders the SVG overlay, runs the timeline, handles skip, and unmounts.
- `src/components/blueprint/mac-cursor.tsx`: an inline SVG of the macOS arrow (inverted white), drawn from scratch rather than copied from Apple's artwork.
- `src/app/layout.tsx`: renders the SSR cover `<div id="bp-cover" aria-hidden>` and `<BlueprintIntro />` inside `<body>`.
- `src/app/globals.css`: cover styles, fail-safes, and `.rise` gating.
- Add `data-blueprint` attributes to: `site-header.tsx`, `app/page.tsx`, `components/list.tsx` (ProductCard image wrapper).

### SSR cover and fail-safes
- `#bp-cover`: `position: fixed; inset: 0; z-index: 100; background: <paper>`, plus a CSS-only grid using `repeating-linear-gradient` so the grid exists before JS. It catches pointer events, so a click skips rather than reaching the page.
- **No JS:** `<noscript><style>#bp-cover{display:none}</style></noscript>`.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce) { #bp-cover { display: none } }`, and the client component also returns early.
- **JS failure or slow hydration:** the cover has a CSS animation `bp-failsafe` that fades it out at 2.5s, so it can never stick. The client component takes over (`data-bp="running"`), which cancels the fail-safe.

### Measurement
1. On mount, wait for `document.fonts.ready`, capped at 300ms, so text boxes are measured after the fonts have loaded.
2. Run `querySelectorAll('[data-blueprint]')` and `getBoundingClientRect()` once, keeping only the rects that intersect the viewport. Measuring once avoids repeated layout recalculation.
3. Construction lines come from the unique left, right, top and bottom edges, de-duplicated within 2px.
4. Render one viewport-sized `<svg>` with all of it. Animate only `stroke-dashoffset`, `opacity` and `transform`.

### Interaction with existing motion
- While `html[data-bp="running"]`, set `.rise { animation-play-state: paused }`. On dissolve, remove the attribute so the existing staggered entrance plays *as* the blueprint fades. The page still "rises in" instead of already being finished under the cover.
- Clicking to skip must not trigger the global sound delegate. The cover is neither `a` nor `button`, and the page under it receives no click, so nothing plays. Verify this during implementation.
- Theme toggle and sound toggle can't be reached during the build (they're covered), which is acceptable at 1.6s.

### Cursor motion
- Travel between boxes: a spring-like ease with a slight overshoot (Motion `type: "spring", bounce: 0.15` for travel only; this is not a UI icon transition).
- Drag: on arrival, press (scale 0.9 for 80ms), then travel linearly from top-left to bottom-right in sync with the rect's draw (about 200ms), then release (scale 1).
- The hotspot is the arrow tip, so offset the SVG so the tip sits exactly on the coordinates.

## Accessibility
- The overlay and cover are `aria-hidden`. Page content stays in the DOM, so screen readers read it immediately.
- No focus trap. Any key skips, so keyboard users lose at most one keystroke.
- Reduced-motion users never see it.

## Performance
- Target: no measurable CLS (the overlay is fixed, so there are no layout changes).
- LCP: content paints under the cover, so the browser should still record LCP at its normal time; verify this in Lighthouse. If LCP regresses, cap the cover at 1.2s on slow devices (`navigator.hardwareConcurrency <= 4`).
- Budget for the component: under 6 KB gzipped, with no new dependencies (Motion is already installed).

## Acceptance criteria
1. A hard load of `/` shows blue paper from the first paint (never the finished page first), the draw sequence, and a dissolve by 1.6s.
2. Client navigation (header link, card click) never replays it.
3. Any click, key, scroll or touch skips to a 200ms dissolve.
4. With reduced motion or JS disabled, the page renders with no cover at all.
5. If hydration is blocked, the cover is gone by 2.5s regardless.
6. Dimension labels match DevTools-measured px (±1).
7. Light theme shows blue and white. Dark theme shows navy and cyan, with no theme flash.
8. At 360px width there are no overlapping labels.
9. The `.rise` entrance plays after the dissolve, not hidden under the cover.
10. Works on `/`, `/writing` and `/projects/[slug]`. Routes with fewer tags draw fewer boxes, and the grid and construction lines still play.

## Open questions
- Should `/admin` routes be excluded? The recommendation is yes: skip when the pathname starts with `/admin`.
- On routes with no tagged elements above the fold (e.g. a short 404), draw only the grid plus a centred `404` label, or skip?

## Revision 1 (2026-11-06, after first review)

- **Rounded corners:** each box reads its element's computed `border-top-left-radius` (`%` resolved against the box, clamped to half the short side). Pills, the round avatar and the `rounded-xl` cards now draw with matching corners, and labels are inset to clear the curve.
- **Hand-off is now a top-to-bottom reveal**, replacing the whole-page dissolve. A soft-edged mask (2.5 viewports tall, 20% feather) sweeps down over 700ms with `cubic-bezier(0.65, 0, 0.35, 1)` (320ms on skip). The page's `.rise` entrance starts as the sweep begins, and the cursor fades over the first half.
- **Smoothness:**
  - The cursor and drag boxes read one shared schedule (`strokes()`) and the same drag curve `cubic-bezier(0.45, 0, 0.2, 1)`, so the cursor tip stays on the growing corner.
  - The cursor no longer overshoots; travel uses `cubic-bezier(0.22, 1, 0.36, 1)`.
  - Stage durations are longer: construction lines 480ms, box trace 460ms, labels 320ms.
- **Timeline:** the reveal starts at 1.55s and finishes around 2.25s. The head script's 2.5s fail-safe is cancelled once the intro takes over, and the intro keeps its own 5s fail-safe.

## Superseded (2026-11-06)

Replaced by the plot intro modelled on imdaryl.com. See `.plans/imdaryl-plot-analysis.md`. The code lives in `src/components/plot/` and `src/app/plot.css`. `src/components/blueprint/` has been removed.
