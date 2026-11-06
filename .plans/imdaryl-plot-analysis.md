# imdaryl.com: how the blueprint "plot" intro works

Source: the production bundle (`/assets/index-*.js`, `/assets/index-*.css`, a Vite + React SPA with no animation library), downloaded and de-minified on 2026-11-06. Identifier names below are the minified ones. Everything here was read from code, so timings are exact rather than estimated from video.

## 1. Architecture

| Piece | What it is |
| --- | --- |
| `j4` | The intro ("plot"). Mounted by the root layout **only on `/`**. |
| `lA()` | The measurer. It walks the live DOM and returns `{ column, parts[], datum, rx, ry }`. |
| `pd` | The permanent page **rulers** (top and left rails). They only render at `min-width: 1360px`. |
| CSS `.plot …` | All drawing motion is CSS keyframes. JS only sets geometry and a few custom properties, plus the wipe. |
| `?draft`, `?map` | Debug query flags, not part of the intro. |

There is **no tagging**: every visible element is discovered automatically.

## 2. Discovery (`lA`)

Scope: `nav`, `.wrap` (the content column) and `footer`. Anything inside `.rulers`, `.plot` or `[aria-hidden=true]` is ignored.

1. **Media and controls first, in document order.** Media is `img, video, iframe, canvas, .editor, .shot`. Controls are `a, button, [role=button], .chip, .tab`.
   - The element must be visible in the viewport and at least 6×6px. Media must be at least 40×24px. Controls inside `<p>` (inline links) are skipped.
   - A control *with text* becomes a `control` part with a **ghost** (see 4). Its `block` is the rect minus padding, and its `anchor` is the first glyph's position.
   - A control *without text* becomes `media` labelled `icon`.
   - Claimed elements are remembered, so nothing inside them is counted twice.
2. **Then text.** A TreeWalker visits every text node. For each one it climbs to the nearest block-level ancestor (`display: block|flex|grid|list-item|table|inline-block|…`) and computes an **ink box**:
   - It takes the union of the text's `Range.getClientRects()`, trimmed vertically by the half-leading `(lineHeight − fontSize)/2`, plus `0.12·fs` at the top and `0.2·fs` at the bottom. That makes the box hug the glyphs rather than the line box.
   - Small inline `svg/img` under 40px are included.
   - The x position is corrected by the first glyph's left side bearing (canvas `measureText().actualBoundingBoxLeft`).
   - Multi-line blocks (ink height > 1.6·fs) use the full padded block width.
   - `kind = head` when `fontSize ≥ 22`, otherwise `text`.
   - Text inside `.role` is flagged `measured`.
3. **Row snapping.** Parts under 40px tall that overlap vertically form a row. All of them get the row's top and height, and media in the row are vertically centred.
4. **Sort** by y, then x. **Duplicate labels** are numbered (`copy 01`, `copy 02`, …).
5. **Labels.**
   - Media: `picture` (or `embed`, `plate`, `fig 0.2`).
   - Controls: `nav` inside `<nav>`, `button`, or `link`.
   - Text: `title` for `h1`, `heading` for `h2–h4`, `note` for `.note/.fig/.kicker/.meta`, otherwise `copy`.
6. **Datum.** A horizontal line 12px under the nav part.
7. **Column.** The `.wrap` rect, used for the side rules and the top width dimension.
8. **Rulers.** The rects of the page rulers, so the blueprint redraws them too.

The `.rise` entrance is neutralized during measurement (`html.setting-out .rise { transform: none !important }`), so boxes are measured at their final positions. Elements at opacity 0 still count if they are inside `.rise`.

## 3. Timeline

Constants: `d4 = 1200` (wipe), `Jm = 560` (first part), `Wm = 110` (per-part stagger), `Pm = 340` (draw duration), `f4 = 900`, `h4 = 320` (measure stagger), `A4 = 70` (letter stagger), `m4 = 360`, `p4 = 160`, `Im = 1200` (max wait for video).

```
placed   L = 560 + n·110 + 340
lettered D = L + (measuredCount ? (measuredCount − 1)·320 + 900 : 0)
done     T = D + n·70 + 360 + 160
```

| t | Event (CSS unless noted) |
| --- | --- |
| 0 | `html.plotting.plotlock`: page content `opacity: 0`, scroll locked (wheel, touchmove and scroll keys are `preventDefault`ed), `cursor: progress`. The blue sheet `.bp` is `#2E6FFF`. |
| 0–500ms | Grid fades in (`bpgrid`, `--settle`). Major lines every 100px at white 0.22 alpha, minor every 20px at white 0.09. Both are offset so x = 0 sits on the column's left edge. |
| 80–680ms | The column side rules draw top to bottom (`clip-path` inset, `--rule`). |
| 200–750ms | The column width dimension draws left to right, with tick ends and the value centred on a paper-coloured knockout. |
| 280–780ms | The datum line draws across the full width. |
| 300–800ms | The redrawn rulers fade in. |
| 450–950ms | Handwritten notes write on (Architects Daughter, rotated −1.2° / +1°, clip-path reveal): left of the column `"01 · setting out"`, right `"issue P4 · blue for setting out"`. These only show when the gutter is at least 220px. |
| 560 + i·110 ms | Part *i* draws: `clip-path: inset(-16px 100% -18px 0)` → `inset(-16px -160px -18px 0)`, opacity 0.5 → 1, over 340ms with `--rule`. Its label pill fades in 300ms later (220ms for block labels). |
| same | Text and head blocks: 1px white border, a −45° hatch (1px line every 5px, white 0.28), and a 110° **shimmer** highlight that sweeps continuously on a 1.4s loop. Media: a border plus both diagonals (an X) plus the shimmer. Controls: a dashed border. |
| `at` of lower part | **Gap** dimensions (vertical space between stacked parts, 2–160px, up to 9) and **run** dimensions (horizontal space between parts in a row, 6–240px, up to 14 total) draw in. Their numbers **count up** from 0 to the real value over 360ms (ease-out quad) in a rAF loop that runs every other frame. Size badges `W × H` appear on heads and non-icon media (up to 18 total). |
| `placed + m·320` | Measured blocks shrink from `--full` (out to the right edge of the parts) to their real width over 900ms. A live width readout and a dashed "slack" dimension show the remaining space. |
| `lettered + i·70` | **Lettering**: the hatched block, its label and all dimensions fade out (`bpunblock`, 300ms). 60ms later the **ghost** fades in (`bpletter`, 360ms): a deep clone of the real element with computed text styles inlined, drawn as outlined type (`color: transparent; -webkit-text-stroke: 0.6px white`). `h1` is filled solid white. Images inside are replaced by X'd boxes. |
| 0→T | A percentage pill follows the pointer (offset +18, +22): 0–60% while plotting, 60–70% while waiting for above-the-fold videos (`readyState ≥ 3`, capped at 1.2s), 70–100% during the wipe. |
| T | **Wipe** (JS rAF): `--y = smoothstep(p)·(vh + 2)` over 1200ms. The sheet is `clip-path: inset(var(--y) 0 0 0)`, so the real page shows above the line. The line is 3px tall with a gradient `#00D4FF → white → #FF4DD8`, a white glow, and 24px paper-coloured end caps. When `--y` passes the hero (`.id` top + 8), `plotting` is removed, so `.rise` entrances play as the line passes. |
| T + 1200ms | Scroll unlocks, the pill fades and scales down. Then 640ms later `ending` fades the line out over 420ms, and the intro unmounts 460ms after that. |

Easings: `--rule: cubic-bezier(0.22, 0.8, 0.24, 1)` (drawing), `--settle: cubic-bezier(0.4, 0, 0.2, 1)` (fades).

Pencil texture: on hover-capable screens ≥761px, the grid, rules, datum and rulers get an SVG filter `#graphite-bold`. It's `feTurbulence` fractal noise at 0.55, 2 octaves, seed 7, then `feDisplacementMap` at scale 2.6, then the grain used as an alpha mask. Lines wobble and break up like graphite.

Resize during the plot: re-measure after a 60ms debounce. Reduced motion skips everything.

## 4. Typography of the drawing
- Labels: JetBrains Mono 8.5px / 13px, 0.08em, uppercase, paper-coloured text on a white pill, radius 2px, sitting 15px above the box. Tall boxes (≥34px) put the label *inside* at 3,3.
- Dimension values: mono 8.5–9.5px, tabular-nums, on a white pill.

## 5. Rulers (`pd`)
- Rails are 19px: one along the top, one down the left. Ticks every 10px (soft) on the bottom/right 6px band. Labelled ticks every 100px, mono 9px, with a 7px tick line. The left rail's labels are vertical (`writing-mode: vertical-rl`).
- **Zero sits at the content column's left edge**, so the top rail reads negative values to the left of the column.
- Live pointer marker: a 24px-wide tinted band with a 1px centre line, a 2px edge bar, and the coordinate value on a background pill.
- Hover selection: hovering a control highlights its extent on both rails (tinted band with edge lines) and prints its width and height.
- Only on wide screens (≥1360px), where there's gutter room.

## 6. Adaptation for this portfolio (what we change, and why)
- **Same model and constants:** auto-discovery, the timeline formulas, easings, colours, grid, wipe, ghost lettering, gap/run/size dimensions, rulers.
- **Roots:** our `header`, `main` and `footer` inside the `.sheet` column.
- **Every full page load on every route** (theirs is home only), excluding `/admin`. This was agreed in the earlier spec.
- **SSR first paint:** our pages are server-rendered, so an inline head script adds `plotting plotlock` and a blue cover before first paint. Theirs is an SPA and paints blank until JS runs. There's a fail-safe timer.
- **Large block links** (product cards, over 80px tall) aren't treated as one dashed control. Their media and text are drawn individually, so a card reads as image plus copy.
- **Corner radius:** media and controls keep their real radius, as Bruno asked earlier. Text blocks keep the original 2px.
- **Skip:** a click or Esc jumps straight to the wipe. The original can't be skipped, and with our per-load replay it would run about 6–7s on every load without this.
- **Dark mode:** the sheet uses navy `#0f2a66` with the same white linework. The original is light-only.
- **Measured text:** opt-in with `data-plot-measure`. The original keys it to `.role`.
- **Rulers** show at ≥1024px (our column is narrower, so the gutters fit sooner).

## 7. Implementation and verification (2026-11-06)
- Code: `src/components/plot/measure.ts` (discovery), `plot-intro.tsx` (clock, counters, wipe), `rulers.tsx`, `src/app/plot.css` (all motion).
- **Dev-only frame inspection:** `/?plotAt=<ms>` freezes every animation at that instant and never wipes. Use it to compare stills.
- **Verified with headless Edge captures at 1280×800:**
  - Same part count (12) and the same `--placed` (2220ms) as the original at that size.
  - Frames at 1100, 1700, 3500 and 4500ms show the grid, column rules, datum line, margin notes, labelled parts, gap/run/size dimensions, measured width shrink (588 → 544), lettering and the wipe.
  - After the plot finishes, the rulers are live and the page settles normally.
- Fixed during verification:
  - The lettering keyframe now runs to opacity 1. The ghost rests at opacity 0, so a `from`-only fade never showed the type.
  - The sheet is now `position: fixed`, so it covers the full paint area.
  - The pill and button outlines (drawn with box-shadow) are restored on ghosts.
