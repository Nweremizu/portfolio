"use client";

import { useEffect, useRef, useState } from "react";
import { useSensoryUI } from "@/components/ui/sensory-ui/config/provider";
import { selectionRect } from "./rulers";

/*
 * Selecting text (a double-clicked word, a dragged range) draws a design-tool
 * selection frame around it: corner handles, a label naming what was selected,
 * and CAD-style width and height dimensions, in the plot's visual language.
 */

const KINDS: [string, string][] = [
  ["h1", "title"],
  ["h2,h3,h4", "heading"],
  ["a,button", "link"],
  ["code,pre", "code"],
  ["blockquote", "quote"],
  ["li", "item"],
  ["p,dd,figcaption", "copy"],
];
/** Where a frame would get in the way or mean nothing. */
const SKIP = ".plot,[contenteditable],input,textarea,select";

interface Box {
  /** Changes per new selection, so each one mounts fresh and draws in. */
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

function labelFor(node: Node) {
  const el = node instanceof Element ? node : node.parentElement;
  for (const [selector, label] of KINDS)
    if (el?.closest(selector)) return label;
  return "text";
}

export default function SelectionBox() {
  const [box, setBox] = useState<Box | null>(null);
  const { playSound } = useSensoryUI();
  const visible = useRef(false);
  const start = useRef<{ node: Node | null; offset: number }>({
    node: null,
    offset: 0,
  });
  const nextId = useRef(0);

  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = selectionRect();
      // selectionRect() is null unless there is a non-empty range to read.
      const anchor = r
        ? getSelection()?.getRangeAt(0).commonAncestorContainer
        : undefined;
      const host = anchor instanceof Element ? anchor : anchor?.parentElement;
      if (!r || !anchor || host?.closest(SKIP)) {
        visible.current = false;
        start.current = { node: null, offset: 0 };
        setBox(null);
        return;
      }
      // Same anchor = the same selection being extended (a drag): keep the
      // frame and let it follow. A new anchor = a new selection: draw anew.
      const sel = getSelection();
      const fresh =
        !visible.current ||
        sel?.anchorNode !== start.current.node ||
        sel?.anchorOffset !== start.current.offset;
      start.current = {
        node: sel?.anchorNode ?? null,
        offset: sel?.anchorOffset ?? 0,
      };
      if (fresh) nextId.current += 1;
      // A soft tick when a frame first appears, not on every drag step.
      if (!visible.current) {
        visible.current = true;
        void playSound("interaction.subtle", { volume: 0.6 });
      }
      setBox({
        id: nextId.current,
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        label: labelFor(anchor),
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    document.addEventListener("selectionchange", schedule);
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("selectionchange", schedule);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [playSound]);

  if (!box) return null;
  const pad = 3;
  return (
    <div
      key={box.id}
      aria-hidden="true"
      className="selection-box"
      style={{
        transform: `translate(${box.x - pad}px, ${box.y - pad}px)`,
        width: box.w + pad * 2,
        height: box.h + pad * 2,
      }}
    >
      <div className="sb-frame">
        <i className="sb-handle tl" />
        <i className="sb-handle tr" />
        <i className="sb-handle bl" />
        <i className="sb-handle br" />
      </div>
      <b className="sb-label">{box.label}</b>
      {/* CAD-style dimensions: offset line, end ticks, value alongside. */}
      <i className="sb-dim sb-dim-w">
        <b>{Math.round(box.w)}</b>
      </i>
      <i className="sb-dim sb-dim-h">
        <b>{Math.round(box.h)}</b>
      </i>
    </div>
  );
}
