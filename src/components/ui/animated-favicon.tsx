"use client";

import { useEffect, useRef } from "react";
import Logo from "./logo";

/**
 * Animates the browser-tab icon: the logo bobs up and down inside the blue
 * badge, matching the mark in the nav.
 *
 * There is no declarative way to do this. Animated GIF favicons only ever
 * worked in Firefox, and no major browser runs animations inside an SVG
 * favicon — it gets rasterised to a single frame. The only approach that works
 * is painting frames to a canvas and swapping the <link> href, which is what
 * this does. Safari ignores favicon updates made from script, so it simply
 * keeps the static `app/icon.svg`; nothing breaks, it just doesn't animate.
 *
 * The static icon remains the source of truth. If this component is removed,
 * or reduced-motion is on, or the SVG fails to load, the tab keeps the plain
 * badge.
 */

const BADGE = 48; // design-space size; matches the nav mark's 48px badge
const CANVAS = 64; // rendered size — 2x keeps it crisp on hidpi tab strips
const FPS = 10; // a favicon needs no more, and each frame costs a PNG encode
const BOB_PX = 4; // how far the logo travels, in badge space
const PERIOD_MS = 2400;

export default function AnimatedFavicon() {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced motion: leave the static icon.svg alone entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const svgEl = holder.current?.querySelector("svg");
    if (!svgEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS;
    canvas.height = CANVAS;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Serialise the real <Logo> rather than duplicating its path data, so the
    // tab icon can never drift from the component.
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svgEl)], {
        type: "image/svg+xml",
      }),
    );

    // Point every icon link at the current frame, rather than removing Next's
    // and adding our own. Two reasons: this effect runs before React has
    // injected the metadata links, so a one-shot capture at mount finds
    // nothing and Next's links appear afterwards and win; and re-querying each
    // tick means any link added later is picked up automatically instead of
    // silently outranking us. Leaving React's own nodes in place also avoids
    // yanking DOM out from under it.
    const hijacked = new Map<HTMLLinkElement, { href: string; type: string }>();
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";

    const applyFrame = (dataUrl: string) => {
      link.href = dataUrl;
      document
        .querySelectorAll<HTMLLinkElement>('link[rel~="icon"]')
        .forEach((l) => {
          if (l === link) return;
          if (!hijacked.has(l))
            hijacked.set(l, {
              href: l.getAttribute("href") ?? "",
              type: l.type,
            });
          // `type` has to move too — a PNG payload behind type="image/svg+xml"
          // can be rejected outright.
          l.type = "image/png";
          l.href = dataUrl;
        });
    };

    const img = new Image();
    let timer: number | undefined;
    let started = false;
    // The image decode is async, so onload can land after this effect has
    // already been torn down — which happens on every Fast Refresh and twice
    // on mount under StrictMode. Without this guard each discarded run still
    // appends its link and starts its interval, and they accumulate.
    let cancelled = false;

    const scale = CANVAS / BADGE;
    const logoH = BADGE;
    const logoW = (364 / 394) * BADGE;
    const logoX = (BADGE - logoW) / 2;
    const baseY = 12; // the nav mark's translate-y-3

    const draw = (t: number) => {
      const phase = (Math.sin((t / PERIOD_MS) * Math.PI * 2) + 1) / 2; // 0..1
      const y = baseY - phase * BOB_PX;

      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, BADGE, BADGE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(BADGE / 2, BADGE / 2, BADGE / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#7e96d3";
      ctx.fill();
      ctx.clip();
      ctx.drawImage(img, logoX, y, logoW, logoH);
      ctx.restore();

      applyFrame(canvas.toDataURL("image/png"));
    };

    const tick = () => draw(performance.now());

    const start = () => {
      if (timer !== undefined) return;
      tick();
      timer = window.setInterval(tick, 1000 / FPS);
    };
    const stop = () => {
      if (timer === undefined) return;
      window.clearInterval(timer);
      timer = undefined;
    };

    // Background tabs are throttled to roughly one timer fire per minute, so
    // running there would burn work to produce a stutter. Park it instead.
    const onVisibility = () => (document.hidden ? stop() : start());

    img.onload = () => {
      if (cancelled) return;
      started = true;
      document.head.appendChild(link);
      start();
      document.addEventListener("visibilitychange", onVisibility);
    };
    // If the SVG fails to load, do nothing — the static icon stays in place.
    img.src = url;

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      URL.revokeObjectURL(url);
      if (started) {
        link.remove();
        hijacked.forEach((original, l) => {
          l.type = original.type;
          l.setAttribute("href", original.href);
        });
      }
    };
  }, []);

  // Offscreen source for the serializer. Not `hidden`/`display:none`: keeping
  // it laid out but clipped avoids any chance of the SVG being skipped, while
  // costing nothing visually and staying out of the a11y tree.
  return (
    <div
      ref={holder}
      aria-hidden
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <Logo />
    </div>
  );
}
