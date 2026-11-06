"use client";

import { useEffect, useRef, useState } from "react";
import { firstTextPoint, measureSheet, type Part, type Sheet } from "./measure";

/*
 * The "plot": on a full page load the page is drafted on blueprint paper —
 * grid, column rules, every element boxed and labelled in turn, spacing
 * measured, then lettered as outline type — and a scan line wipes the real
 * page in from the top. Drawing is CSS (app/plot.css); this component owns
 * geometry, the clock, live counters and the wipe.
 * Model and timings: .plans/imdaryl-plot-analysis.md
 */

const FIRST = 560; // first part starts drawing
const STEP = 110; // stagger between parts
const DRAW = 340; // one part's draw
const MEASURE_LEAD = 900;
const MEASURE_STEP = 320;
const LETTER_STEP = 70;
const LETTER_TAIL = 360;
const END_PAD = 160;
const WIPE = 1200;
const TAIL = 640;
const END_FADE = 460;
const COUNT_MS = 360;

const partAt = (i: number) => FIRST + i * STEP + DRAW;

interface Extra {
  kind: "gap" | "run" | "size";
  x: number;
  y: number;
  w?: number;
  h?: number;
  text: string;
  at: number;
}

/** Spacing worth annotating: vertical gaps, horizontal runs, sizes of big things. */
function extras(parts: Part[]): Extra[] {
  const out: Extra[] = [];
  const overlapX = (a: Part, b: Part) => a.x < b.x + b.w && b.x < a.x + a.w;
  const overlapY = (a: Part, b: Part) => a.y < b.y + b.h && b.y < a.y + a.h;

  for (const a of parts) {
    if (out.length >= 9) break;
    const below = parts
      .filter((b) => b !== a && b.y >= a.y + a.h && overlapX(a, b))
      .sort((p, q) => p.y - q.y)[0];
    if (!below) continue;
    const gap = below.y - (a.y + a.h);
    if (gap < 2 || gap > 160) continue;
    if (out.some((e) => e.kind === "gap" && e.y === a.y + a.h && e.h === gap))
      continue;
    out.push({
      kind: "gap",
      x: Math.max(a.x, below.x) - 14,
      y: a.y + a.h,
      h: gap,
      text: String(gap),
      at: partAt(parts.indexOf(below)),
    });
  }
  for (const a of parts) {
    if (out.length >= 14) break;
    const next = parts
      .filter((b) => b !== a && b.x >= a.x + a.w && overlapY(a, b))
      .sort((p, q) => p.x - q.x)[0];
    if (!next) continue;
    const run = next.x - (a.x + a.w);
    if (run < 6 || run > 240) continue;
    const mid =
      (Math.max(a.y, next.y) + Math.min(a.y + a.h, next.y + next.h)) / 2;
    out.push({
      kind: "run",
      x: a.x + a.w,
      y: mid,
      w: run,
      text: String(run),
      at: partAt(parts.indexOf(next)),
    });
  }
  for (const a of parts) {
    if (out.length >= 18) break;
    if (a.kind !== "head" && (a.kind !== "media" || a.label.startsWith("icon")))
      continue;
    out.push({
      kind: "size",
      x: a.x + a.w / 2,
      y: a.y + a.h + 6,
      text: `${a.w} × ${a.h}`,
      at: partAt(parts.indexOf(a)),
    });
  }
  return out;
}

const roots = () => [
  ...document.querySelectorAll(
    ".sheet > header, .sheet > main, .sheet > footer",
  ),
];
const column = () => document.querySelector(".sheet");

function GraphiteFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <filter
        id="plot-graphite"
        x="-3%"
        y="-3%"
        width="106%"
        height="106%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.55 0.55"
          numOctaves={2}
          seed={7}
          result="grain"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="grain"
          scale={2.6}
          xChannelSelector="R"
          yChannelSelector="G"
          result="wavered"
        />
        <feColorMatrix
          in="grain"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 0.05"
          result="wear"
        />
        <feComposite in="wavered" in2="wear" operator="in" />
      </filter>
    </svg>
  );
}

export default function PlotIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [finished, setFinished] = useState(false);
  const t0 = useRef(0);
  const counters = useRef<HTMLElement[]>([]); // gap/run: count 0 → target
  const widths = useRef<HTMLElement[]>([]); // measured: live width
  const slacks = useRef<
    { el: HTMLElement; block: HTMLElement; right: number }[]
  >([]);
  const ghosts = useRef(new Map<number, HTMLElement>());

  // Lifecycle: lock, measure, clock, wipe, release.
  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    if (!root || !html.classList.contains("plotting")) {
      setFinished(true);
      return;
    }
    const w = window as Window & { __plotFailsafe?: number };
    clearTimeout(w.__plotFailsafe);
    html.dataset.plot = "mounted";
    html.classList.add("plotlock");
    window.scrollTo(0, 0);

    const block = (e: Event) => e.preventDefault();
    const scrollKeys = [
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
    ];
    const keys = (e: KeyboardEvent) => {
      if (scrollKeys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", keys);

    let cancelled = false;
    let raf = 0;
    let timer = 0;
    let wiping = false;
    let unbind: (() => void) | null = null;

    // Detaching leaves `plotting` alone: StrictMode's dev re-run must still
    // find it. Only finishing (or the wipe passing the content) clears it.
    const detach = () => {
      unbind?.();
      unbind = null;
      html.classList.remove("plotlock");
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", keys);
    };
    const finish = () => {
      detach();
      html.classList.remove("plotting");
      delete html.dataset.plot;
      setFinished(true);
    };

    const measure = () => {
      html.classList.add("setting-out");
      const s = measureSheet(roots(), column());
      html.classList.remove("setting-out");
      counters.current = [];
      widths.current = [];
      slacks.current = [];
      return s;
    };

    document.fonts.ready.then(() => {
      if (cancelled) return;
      const s = measure();
      t0.current = performance.now();
      setSheet(s);
      let vh = root.clientHeight;

      const n = s.parts.length;
      const placed = FIRST + n * STEP + DRAW;
      const measuredCount = s.parts.filter((p) => p.measured).length;
      const lettered =
        placed +
        (measuredCount ? (measuredCount - 1) * MEASURE_STEP + MEASURE_LEAD : 0);
      root.style.setProperty("--placed", `${placed}ms`);
      root.style.setProperty("--lettered", `${lettered}ms`);
      const total = lettered + n * LETTER_STEP + LETTER_TAIL + END_PAD;

      // Progress tag riding the pointer.
      const pct = root.querySelector<HTMLElement>(".plot-pct");
      let shown = 0;
      const progress = (v: number) => {
        shown = Math.max(shown, Math.min(1, v));
        if (pct) pct.dataset.v = `${Math.round(shown * 100)}%`;
      };
      const follow = (e: PointerEvent) => {
        if (!pct) return;
        pct.style.translate = `${e.clientX + 18}px ${e.clientY + 22}px`;
        pct.hidden = false;
      };
      window.addEventListener("pointermove", follow, { passive: true });

      // Re-plot on resize.
      let resizeT = 0;
      const onResize = () => {
        clearTimeout(resizeT);
        resizeT = window.setTimeout(() => {
          if (wiping) return;
          vh = root.clientHeight;
          setSheet(measure());
        }, 60);
      };
      window.addEventListener("resize", onResize);

      const hero =
        (document.querySelector(".sheet > main")?.getBoundingClientRect().top ??
          vh * 0.25) + 8;

      const wipe = () => {
        if (wiping) return;
        wiping = true;
        clearTimeout(timer);
        root.classList.add("wiping");
        progress(0.7);
        const start = performance.now();
        let released = false;
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / WIPE);
          const y = p * p * (3 - 2 * p) * (vh + 2); // smoothstep
          root.style.setProperty("--y", `${y}px`);
          progress(0.7 + 0.3 * p);
          // The page's own entrance plays as the line passes the content.
          if (!released && y >= hero) {
            released = true;
            html.classList.remove("plotting");
          }
          if (p < 1) {
            raf = requestAnimationFrame(step);
            return;
          }
          detach();
          html.classList.remove("plotting");
          pct?.classList.add("gone");
          timer = window.setTimeout(() => {
            root.classList.add("ending");
            timer = window.setTimeout(finish, END_FADE);
          }, TAIL);
        };
        raf = requestAnimationFrame(step);
      };

      const tick = () => {
        if (cancelled) return;
        const t = performance.now() - t0.current;
        progress(t < total ? (0.6 * t) / total : 0.6);
        if (t >= total) wipe();
        else timer = window.setTimeout(tick, 80);
      };
      // Dev only: ?plotAt=<ms> freezes the drawing at that instant, for
      // frame-by-frame comparison. The clock never advances to the wipe.
      const freezeAt =
        process.env.NODE_ENV !== "production"
          ? Number(new URLSearchParams(location.search).get("plotAt"))
          : 0;
      if (freezeAt > 0) {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            for (const a of document.getAnimations()) {
              a.pause();
              a.currentTime = freezeAt;
            }
            t0.current = performance.now() - freezeAt;
          }),
        );
        return;
      }
      timer = window.setTimeout(tick, 80);

      // Click or Esc skips straight to the wipe.
      const skip = (e: Event) => {
        if (e instanceof KeyboardEvent && e.key !== "Escape") return;
        wipe();
      };
      window.addEventListener("pointerdown", skip);
      window.addEventListener("keydown", skip);

      unbind = () => {
        clearTimeout(resizeT);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", follow);
        window.removeEventListener("pointerdown", skip);
        window.removeEventListener("keydown", skip);
      };
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      detach();
      html.classList.remove("setting-out");
    };
  }, []);

  // Pin each ghost's first glyph onto the real text's first glyph.
  useEffect(() => {
    if (!sheet) return;
    for (const [i, el] of ghosts.current) {
      const anchor = sheet.parts[i]?.anchor;
      el.style.translate = "";
      const at = anchor && firstTextPoint(el);
      if (anchor && at)
        el.style.translate = `${anchor.x - at.x}px ${anchor.y - at.y}px`;
    }
  }, [sheet]);

  // Live numbers: dimensions count up, measured widths and slack track the
  // shrinking blocks. Every other frame is plenty for text.
  useEffect(() => {
    if (!sheet || finished) return;
    let raf = 0;
    let odd = false;
    const frame = (now: number) => {
      odd = !odd;
      if (odd) {
        raf = requestAnimationFrame(frame);
        return;
      }
      for (const el of widths.current) {
        const v = String(Math.round(el.getBoundingClientRect().width));
        if (el.dataset.v !== v) el.dataset.v = v;
      }
      for (const { el, block, right } of slacks.current) {
        const r = block.getBoundingClientRect();
        const left = Math.round(r.right + window.scrollX);
        const w = Math.max(0, right - left);
        el.style.left = `${left}px`;
        el.style.width = `${w}px`;
        el.style.top = `${Math.round(r.top + window.scrollY + r.height / 2)}px`;
        el.dataset.v = String(w);
        el.style.visibility = w < 8 ? "hidden" : "visible";
      }
      const t = now - t0.current;
      for (const el of counters.current) {
        const p = Math.min(
          1,
          Math.max(0, (t - Number(el.dataset.at)) / COUNT_MS),
        );
        const eased = 1 - (1 - p) * (1 - p);
        const v = String(Math.round(Number(el.dataset.target) * eased));
        if (el.dataset.v !== v) el.dataset.v = v;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [sheet, finished]);

  if (finished) return null;

  const box = (r: { x: number; y: number; w: number; h: number }) => ({
    left: r.x,
    top: r.y,
    width: r.w,
    height: r.h,
  });

  let right = 0;
  let notes = false;
  let ex: Extra[] = [];
  if (sheet) {
    const c = sheet.column;
    const headRight = Math.max(
      ...sheet.parts.filter((p) => p.y < sheet.datum).map((p) => p.x + p.w),
      c.x + Math.min(c.w, 1),
    );
    right = headRight > c.x + 200 ? headRight : c.x + c.w;
    notes = c.x >= 220;
    ex = extras(sheet.parts);
  }
  const vars = (o: Record<string, string | number>) => o as React.CSSProperties;
  const measuredBefore = (i: number) =>
    sheet ? sheet.parts.slice(0, i).filter((p) => p.measured).length : 0;

  return (
    <div ref={rootRef} className="plot" aria-hidden="true">
      <GraphiteFilter />
      <div
        className="plot-sheet"
        style={sheet ? vars({ "--zerox": `${sheet.column.x}px` }) : undefined}
      >
        {sheet && (
          <>
            <i className="plot-datum" style={{ top: sheet.datum }} />
            <i className="plot-col" style={box(sheet.column)} />
            <span
              className="plot-dim"
              style={{
                left: sheet.column.x,
                top: sheet.column.y + 14,
                width: sheet.column.w,
              }}
            >
              <b>{Math.round(sheet.column.w)}</b>
            </span>
            {notes && (
              <>
                <span
                  className="plot-note"
                  style={{
                    right: window.innerWidth - sheet.column.x + 18,
                    top: sheet.column.y + 30,
                  }}
                >
                  sheet 01 · setting out
                </span>
                <span
                  className="plot-note r"
                  style={{
                    left: sheet.column.x + sheet.column.w + 18,
                    top: sheet.column.y + 30,
                  }}
                >
                  rev 2026.11 · blue for setting out
                </span>
              </>
            )}

            {sheet.parts.map((p, i) => {
              const tall = p.h >= 34 ? " is-tall" : "";
              const m = measuredBefore(i);
              const radius =
                p.kind === "media" || p.kind === "control"
                  ? p.radius
                  : undefined;
              if (!(p.ghost && p.block)) {
                return (
                  <span key={p.label} style={{ display: "contents" }}>
                    <i
                      className={`plot-part pl-${p.kind}${tall}`}
                      style={{
                        ...box(p),
                        borderRadius: radius,
                        ...vars({ "--i": i }),
                      }}
                    />
                    <b
                      className={`plot-label${tall}`}
                      style={{ left: p.x, top: p.y, ...vars({ "--i": i }) }}
                    >
                      {p.label}
                    </b>
                  </span>
                );
              }
              const blockVars = vars({
                "--i": i,
                "--m": m,
                "--full": `${right - p.x}px`,
                "--w": `${p.w}px`,
              });
              return (
                <span key={p.label} style={{ display: "contents" }}>
                  <i
                    className={`plot-part pl-${p.kind} is-block${tall}${p.measured ? " is-measured" : ""}`}
                    style={{ ...box(p), borderRadius: radius, ...blockVars }}
                    data-label={p.label}
                  />
                  {p.measured && (
                    <b
                      className="plot-width"
                      style={{ left: p.x, top: p.y + p.h + 4, ...blockVars }}
                      ref={(el) => {
                        if (el && !widths.current.includes(el))
                          widths.current.push(el);
                      }}
                    />
                  )}
                  <b
                    className={`plot-label on-block${tall}${p.kind === "control" ? " is-control" : ""}`}
                    style={{ left: p.x, top: p.y, ...vars({ "--i": i }) }}
                  >
                    {p.label}
                  </b>
                  <i
                    className="plot-words"
                    style={{
                      ...box(p.block),
                      width: p.block.w + 2,
                      height: "auto",
                      ...vars({ "--i": i }),
                    }}
                    ref={(el) => {
                      if (!el || !p.ghost) return;
                      ghosts.current.set(i, el);
                      // A re-measure brings a fresh clone; swap it in.
                      if (el.firstChild !== p.ghost)
                        el.replaceChildren(p.ghost);
                    }}
                  />
                </span>
              );
            })}

            {sheet.parts.map((p, i) =>
              p.measured ? (
                <i
                  key={`slack-${p.label}`}
                  className="plot-slack"
                  data-v="0"
                  style={{
                    visibility: "hidden",
                    ...vars({ "--m": measuredBefore(i) }),
                  }}
                  ref={(el) => {
                    const blockEl =
                      el?.parentElement?.querySelector<HTMLElement>(
                        `.is-measured[data-label="${p.label}"]`,
                      );
                    if (
                      el &&
                      blockEl &&
                      !slacks.current.some((s) => s.el === el)
                    )
                      slacks.current.push({ el, block: blockEl, right });
                  }}
                />
              ) : null,
            )}

            {ex.map((e) =>
              e.kind === "size" ? (
                <i
                  key={`${e.kind}-${e.x}-${e.y}`}
                  className="plot-size"
                  style={{
                    left: e.x,
                    top: e.y,
                    ...vars({ "--at": `${e.at}ms` }),
                  }}
                  data-v={e.text}
                />
              ) : (
                <i
                  key={`${e.kind}-${e.x}-${e.y}`}
                  className={`plot-${e.kind}`}
                  style={{
                    left: e.x,
                    top: e.y,
                    height: e.h,
                    width: e.w,
                    ...vars({ "--at": `${e.at}ms` }),
                  }}
                  data-v="0"
                  data-target={e.text}
                  data-at={e.at}
                  ref={(el) => {
                    if (el && !counters.current.includes(el))
                      counters.current.push(el);
                  }}
                />
              ),
            )}

            {sheet.rx && <i className="plot-ruler x" style={box(sheet.rx)} />}
            {sheet.ry && <i className="plot-ruler y" style={box(sheet.ry)} />}
          </>
        )}
      </div>
      <b className="plot-pct" data-v="0%" hidden />
      <div className="plot-line" />
    </div>
  );
}
