"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Drafting rulers along the page's top and left edges. Zero sits on the
 * content column's left edge, ticks every 10px, numbers every 100px. A marker
 * tracks the pointer with its coordinate, and hovering a control shades its
 * extent on both rails with its width and height. Wide, mouse-driven screens
 * only — there is no gutter for them otherwise.
 */

const EVERY = 100;
const HOVERABLE = "a,button,input,select,textarea,[role=button]";
const QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

const ticks = (zero: number, length: number) => {
  const out: { at: number; label: number }[] = [];
  for (let d = Math.ceil(-zero / EVERY) * EVERY; zero + d <= length; d += EVERY)
    out.push({ at: Math.round(zero + d), label: d });
  return out;
};

/** Bounding box of a non-empty text selection, in viewport coordinates. */
export function selectionRect(): DOMRect | null {
  const sel = getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0).getBoundingClientRect();
  return r.width >= 1 && r.height >= 1 ? r : null;
}

function useMedia(query: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = matchMedia(query);
    const update = () => setOn(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return on;
}

export default function Rulers() {
  const enabled = useMedia(QUERY);
  const ref = useRef<HTMLDivElement>(null);
  const xVal = useRef<HTMLSpanElement>(null);
  const yVal = useRef<HTMLSpanElement>(null);
  const wVal = useRef<HTMLSpanElement>(null);
  const hVal = useRef<HTMLSpanElement>(null);
  const [xs, setXs] = useState<{ at: number; label: number }[]>([]);
  const [ys, setYs] = useState<{ at: number; label: number }[]>([]);

  // Scale: re-laid whenever the page or column changes size.
  useEffect(() => {
    if (!enabled) return;
    const layout = () => {
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (!box.width) return;
      const col = document.querySelector(".sheet")?.getBoundingClientRect();
      const zero = col ? col.left - box.left : 0;
      el.style.setProperty("--zerox", `${zero}px`);
      setXs(ticks(zero, box.width));
      setYs(ticks(0, box.height));
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(document.documentElement);
    if (ref.current) ro.observe(ref.current);
    document.fonts?.ready.then(layout);
    return () => ro.disconnect();
  }, [enabled]);

  // Pointer marker.
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let cx = -1;
    let cy = -1;
    const paint = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const zero = Number.parseFloat(el.style.getPropertyValue("--zerox")) || 0;
      const x = cx - box.left;
      const y = cy - box.top;
      const inside = x >= 0 && x <= box.width && y >= 0 && y <= box.height;
      el.style.setProperty("--on", inside ? "1" : "0");
      el.style.setProperty("--x", `${Math.max(0, Math.min(box.width, x))}px`);
      el.style.setProperty("--y", `${Math.max(0, Math.min(box.height, y))}px`);
      if (xVal.current) xVal.current.textContent = String(Math.round(x - zero));
      if (yVal.current) yVal.current.textContent = String(Math.round(y));
    };
    const move = (e: PointerEvent | Event) => {
      if (e instanceof PointerEvent) {
        cx = e.clientX;
        cy = e.clientY;
      }
      if (cx >= 0 && !raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  // Extent of the text selection, else of the hovered control.
  useEffect(() => {
    if (!enabled) return;
    let target: Element | null = null;
    const show = () => {
      const el = ref.current;
      if (!el) return;
      const r = selectionRect() ?? target?.getBoundingClientRect();
      if (!r) {
        el.style.setProperty("--sel", "0");
        return;
      }
      const box = el.getBoundingClientRect();
      el.style.setProperty("--sel", "1");
      el.style.setProperty("--sx", `${r.left - box.left}px`);
      el.style.setProperty("--sw", `${r.width}px`);
      el.style.setProperty("--sy", `${r.top - box.top}px`);
      el.style.setProperty("--sh", `${r.height}px`);
      if (wVal.current) wVal.current.textContent = String(Math.round(r.width));
      if (hVal.current) hVal.current.textContent = String(Math.round(r.height));
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest(HOVERABLE) ?? null;
      if (t !== target) {
        target = t;
        show();
      }
    };
    window.addEventListener("pointerover", over);
    window.addEventListener("scroll", show, { passive: true });
    document.addEventListener("selectionchange", show);
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("scroll", show);
      document.removeEventListener("selectionchange", show);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ref} className="rulers" aria-hidden="true">
      <div className="rx">
        <i className="rticks" />
        {xs.map((t) => (
          <span key={t.label} className="rtick" style={{ left: t.at }}>
            {t.label}
          </span>
        ))}
        <i className="rsel" />
        <span className="rsize" ref={wVal} />
        <i className="rmark" />
        <span className="rval" ref={xVal} />
      </div>
      <div className="ry">
        <i className="rticks" />
        {ys.map((t) => (
          <span key={t.label} className="rtick" style={{ top: t.at }}>
            {t.label}
          </span>
        ))}
        <i className="rsel" />
        <span className="rsize" ref={hVal} />
        <i className="rmark" />
        <span className="rval" ref={yVal} />
      </div>
      <i className="rcorner" />
    </div>
  );
}
