/*
 * Reads the live page into a drafting "sheet": every visible text block,
 * control and media element as a box, plus the column, a datum line and the
 * rulers. Nothing is tagged; discovery is automatic. See
 * .plans/imdaryl-plot-analysis.md for the model this follows.
 */

export type Kind = "head" | "text" | "media" | "control";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Part extends Rect {
  kind: Kind;
  label: string;
  /** Real corner radius, so pills and rounded media draw as such. */
  radius: number;
  /** Text blocks/controls: a styled clone, drawn as outlined type at the end. */
  ghost?: HTMLElement;
  /** Content box (rect minus padding) the ghost is laid into. */
  block?: Rect;
  /** First glyph's top-left, to pin the ghost onto the real text. */
  anchor?: { x: number; y: number };
  measured?: boolean;
}

export interface Sheet {
  column: Rect;
  parts: Part[];
  datum: number;
  rx?: Rect;
  ry?: Rect;
}

const MAX_PARTS = 120;
const MEDIA = "img,video,iframe,canvas,[role=img]";
const CONTROL = "a,button,[role=button]";
/** Chrome that is never drawn. */
export const SKIP = ".rulers,.plot,[aria-hidden='true']";
const BLOCK_DISPLAY =
  /^(block|flex|grid|list-item|table|inline-block|inline-flex|inline-grid|flow-root)$/;
/** Links taller than this are treated as containers (cards), not controls. */
const CARD_HEIGHT = 80;

/** Document-space rect with rounded edges (right/bottom rounded separately). */
function toRect(r: {
  left: number;
  top: number;
  width: number;
  height: number;
}): Rect {
  const x = Math.round(r.left + window.scrollX);
  const y = Math.round(r.top + window.scrollY);
  return {
    x,
    y,
    w: Math.round(r.left + window.scrollX + r.width) - x,
    h: Math.round(r.top + window.scrollY + r.height) - y,
  };
}

/** Hidden by anything between `el` and `root`? Opacity 0 counts unless it is a pending .rise entrance. */
function hiddenWithin(el: Element | null, root: Element) {
  for (let n = el; n && n !== root; n = n.parentElement) {
    if (n.matches(SKIP)) return true;
    const cs = getComputedStyle(n);
    if (cs.display === "none" || cs.visibility === "hidden") return true;
    if (Number(cs.opacity) === 0 && !n.closest(".rise")) return true;
  }
  return false;
}

const ctx =
  typeof document !== "undefined"
    ? document.createElement("canvas").getContext("2d")
    : null;

/** Left side bearing of the first glyph, so the box starts at the ink, not the advance. */
function firstGlyphBearing(el: Element) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const ch = (n.textContent ?? "").trim()[0];
    if (!ch || !n.parentElement || !ctx || hiddenWithin(n.parentElement, el))
      continue;
    ctx.font = getComputedStyle(n.parentElement).font;
    return Math.max(0, -ctx.measureText(ch).actualBoundingBoxLeft);
  }
  return 0;
}

/** Document position of the first rendered glyph. */
export function firstTextPoint(el: Element) {
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim() || !n.parentElement) continue;
    if (hiddenWithin(n.parentElement, el)) continue;
    range.selectNodeContents(n);
    const r = range.getClientRects()[0];
    if (r?.width)
      return { x: r.left + window.scrollX, y: r.top + window.scrollY };
  }
  return null;
}

/** Tight box around the glyphs (line boxes trimmed by half-leading and cap/descender slack). */
function inkBox(el: Element) {
  let l = Infinity;
  let t = Infinity;
  let r = -Infinity;
  let b = -Infinity;
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue;
    const p = n.parentElement;
    if (!p || hiddenWithin(p, el)) continue;
    const cs = getComputedStyle(p);
    const fs = Number.parseFloat(cs.fontSize) || 14;
    const lh = Number.parseFloat(cs.lineHeight) || fs * 1.4;
    const lead = Math.max(0, (lh - fs) / 2);
    range.selectNodeContents(n);
    for (const c of range.getClientRects()) {
      if (!c.width || !c.height) continue;
      l = Math.min(l, c.left);
      t = Math.min(t, c.top + lead + fs * 0.12);
      r = Math.max(r, c.right);
      b = Math.max(b, c.bottom - lead - fs * 0.2);
    }
  }
  for (const m of el.querySelectorAll("svg,img")) {
    if (hiddenWithin(m, el)) continue;
    const c = m.getBoundingClientRect();
    if (!c.width || !c.height || c.width >= 40) continue;
    l = Math.min(l, c.left);
    t = Math.min(t, c.top);
    r = Math.max(r, c.right);
    b = Math.max(b, c.bottom);
  }
  return l === Infinity || b <= t ? null : new DOMRect(l, t, r - l, b - t);
}

const TEXT_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontStretch",
  "fontVariant",
  "fontKerning",
  "fontVariantNumeric",
  "fontFeatureSettings",
  "letterSpacing",
  "wordSpacing",
  "textTransform",
  "textIndent",
  "whiteSpace",
  "textAlign",
  "lineHeight",
  "verticalAlign",
  "alignItems",
  "justifyContent",
  "gap",
  "flexDirection",
  "flexWrap",
  "columnGap",
  "rowGap",
] as const;

/** Deep clone with computed type inlined, media swapped for crossed boxes. */
function ghostOf(el: Element): HTMLElement {
  const copy = el.cloneNode(true) as HTMLElement;
  const src = [el, ...el.querySelectorAll("*")];
  const dst = [copy, ...copy.querySelectorAll("*")] as HTMLElement[];
  dst.forEach((d, i) => {
    const s = src[i];
    const cs = getComputedStyle(s);
    for (const a of ["id", "href", "tabindex", "style", "srcset"])
      d.removeAttribute(a);
    if (d.matches("svg,img,video,canvas,iframe")) {
      const r = s.getBoundingClientRect();
      const box = document.createElement("i");
      box.className = "plot-icon";
      Object.assign(box.style, {
        width: `${r.width}px`,
        height: `${r.height}px`,
        marginLeft: cs.marginLeft,
        marginRight: cs.marginRight,
        verticalAlign: cs.verticalAlign,
        flex: cs.flex,
        borderRadius: cs.borderRadius,
      });
      d.replaceWith(box);
      return;
    }
    if (d.matches(SKIP)) {
      d.remove();
      return;
    }
    for (const p of TEXT_PROPS) d.style[p] = cs[p];
    d.style.display = cs.display;
    d.style.margin = "0";
    d.style.padding = cs.padding;
    d.style.opacity = "1";
    d.style.transform = "none";
    d.style.animation = "none";
    d.style.transition = "none";
  });
  return copy;
}

function labelOf(el: Element, kind: Kind) {
  if (kind === "media") {
    if (el.tagName === "IFRAME") return "embed";
    if (el.matches("[role=img]")) return "drawing";
    return "picture";
  }
  if (kind === "control") {
    if (el.closest("nav")) return "nav";
    return el.tagName === "BUTTON" ? "button" : "link";
  }
  if (el.matches("h1")) return "title";
  if (el.matches("h2,h3,h4")) return "heading";
  if (el.matches(".font-mono, .note")) return "note";
  return "copy";
}

function radiusOf(cs: CSSStyleDeclaration, w: number, h: number) {
  const raw = cs.borderTopLeftRadius;
  const v = raw.endsWith("%")
    ? (Number.parseFloat(raw) / 100) * Math.min(w, h)
    : Number.parseFloat(raw) || 0;
  return Math.min(v, w / 2, h / 2);
}

export function measureSheet(
  roots: Element[],
  columnEl: Element | null,
): Sheet {
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const col = columnEl?.getBoundingClientRect();
  const column: Rect = col
    ? {
        x: Math.round(col.left + window.scrollX),
        y: window.scrollY,
        w: Math.round(col.width),
        h: vh,
      }
    : { x: 0, y: window.scrollY, w: vw, h: vh };

  const parts: Part[] = [];
  const claimed: Element[] = [];
  const isClaimed = (el: Element) =>
    claimed.some((c) => c === el || c.contains(el));
  const onScreen = (r: DOMRect) =>
    r.width >= 6 &&
    r.height >= 6 &&
    r.bottom > 0 &&
    r.top < vh &&
    r.right > 0 &&
    r.left < vw;
  const blockAncestor = (el: Element | null) => {
    for (let n = el; n && n !== document.body; n = n.parentElement)
      if (BLOCK_DISPLAY.test(getComputedStyle(n).display)) return n;
    return null;
  };
  const invisible = (el: Element, cs: CSSStyleDeclaration) =>
    cs.visibility === "hidden" ||
    (Number(cs.opacity) === 0 && !el.closest(".rise"));

  for (const root of roots) {
    // 1. Media and controls, document order.
    for (const el of root.querySelectorAll(`${MEDIA},${CONTROL}`)) {
      if (parts.length >= MAX_PARTS) break;
      if (isClaimed(el) || el.closest(SKIP)) continue;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      if (!onScreen(r) || invisible(el, cs)) continue;
      const kind: Kind = el.matches(MEDIA) ? "media" : "control";
      if (kind === "media" && (r.width < 40 || r.height < 24)) continue;
      if (kind === "control" && el.closest("p")) continue;
      // Cards: let their image and copy be drawn individually.
      if (kind === "control" && r.height > CARD_HEIGHT) continue;

      claimed.push(el);
      const radius = radiusOf(cs, r.width, r.height);
      if (kind === "control" && el.textContent?.trim()) {
        const pl = Number.parseFloat(cs.paddingLeft) || 0;
        const pr = Number.parseFloat(cs.paddingRight) || 0;
        const pt = Number.parseFloat(cs.paddingTop) || 0;
        parts.push({
          kind,
          label: labelOf(el, kind),
          ...toRect(r),
          radius,
          ghost: ghostOf(el),
          block: toRect({
            left: r.left + pl,
            top: r.top + pt,
            width: r.width - pl - pr,
            height: r.height,
          }),
          anchor: firstTextPoint(el) ?? undefined,
        });
      } else {
        parts.push({
          kind: "media",
          label: kind === "control" ? "icon" : labelOf(el, kind),
          ...toRect(r),
          radius,
        });
      }
    }

    // 2. Text, grouped by nearest block-level ancestor.
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (
      let n = walk.nextNode();
      n && parts.length < MAX_PARTS;
      n = walk.nextNode()
    ) {
      if (!n.textContent?.trim()) continue;
      const el = blockAncestor(n.parentElement);
      if (!el || isClaimed(el) || el.closest(SKIP)) continue;
      const cs = getComputedStyle(el);
      if (invisible(el, cs)) continue;
      const ink = inkBox(el);
      if (!ink || !onScreen(ink)) continue;
      claimed.push(el);

      const fs = Number.parseFloat(cs.fontSize) || 14;
      const kind: Kind = fs >= 22 ? "head" : "text";
      const br = el.getBoundingClientRect();
      const pl = Number.parseFloat(cs.paddingLeft) || 0;
      const pr = Number.parseFloat(cs.paddingRight) || 0;
      const pt = Number.parseFloat(cs.paddingTop) || 0;
      const block = toRect({
        left: br.left + pl,
        top: br.top + pt,
        width: br.width - pl - pr,
        height: br.height,
      });
      const inkRect = toRect(ink);
      const x =
        getComputedStyle(el, "::before").content !== "none"
          ? block.x
          : Math.round(ink.left + window.scrollX + firstGlyphBearing(el));
      const tight = { ...inkRect, x, w: inkRect.x + inkRect.w - x };
      // Wrapped paragraphs span the full measure, not just the ragged ink.
      const box =
        ink.height > fs * 1.6 ? { ...tight, x: block.x, w: block.w } : tight;
      parts.push({
        kind,
        label: labelOf(el, kind),
        ...box,
        radius: 2,
        ghost: ghostOf(el),
        block,
        anchor: firstTextPoint(el) ?? undefined,
        measured: kind === "text" && el.closest("[data-plot-measure]") !== null,
      });
    }
  }

  // 3. Snap small items sharing a row onto one top/height.
  const overlapY = (a: Rect, b: Rect) => a.y < b.y + b.h && b.y < a.y + a.h;
  const done = new Set<Part>();
  for (const p of parts) {
    if (done.has(p) || p.h >= 40) continue;
    const row = [p];
    for (const q of parts)
      if (
        q !== p &&
        !done.has(q) &&
        q.h < 40 &&
        row.some((r) => overlapY(r, q))
      )
        row.push(q);
    if (row.length < 2) continue;
    const top = Math.min(...row.map((q) => q.y));
    const bottom = Math.max(...row.map((q) => q.y + q.h));
    for (const q of row) {
      done.add(q);
      if (q.kind === "media") q.y = Math.round(top + (bottom - top - q.h) / 2);
      else {
        q.y = top;
        q.h = bottom - top;
      }
    }
  }

  // 4. Reading order, then number repeated labels.
  parts.sort((a, b) => a.y - b.y || a.x - b.x);
  const counts = new Map<string, number>();
  for (const p of parts) counts.set(p.label, (counts.get(p.label) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const p of parts) {
    if ((counts.get(p.label) ?? 0) < 2) continue;
    const k = (seen.get(p.label) ?? 0) + 1;
    seen.set(p.label, k);
    p.label = `${p.label} ${String(k).padStart(2, "0")}`;
  }

  // 5. Datum under the header's contents; rulers if present.
  const header = roots.find((r) => r.matches("header"));
  const headerParts = header
    ? parts.filter((p) => {
        const hr = header.getBoundingClientRect();
        return p.y + p.h <= hr.bottom + window.scrollY;
      })
    : [];
  const datum = headerParts.length
    ? Math.max(...headerParts.map((p) => p.y + p.h)) + 12
    : column.y + 56;
  const rx = document.querySelector(".rulers .rx")?.getBoundingClientRect();
  const ry = document.querySelector(".rulers .ry")?.getBoundingClientRect();

  return {
    column,
    parts,
    datum,
    rx: rx?.width ? toRect(rx) : undefined,
    ry: ry?.height ? toRect(ry) : undefined,
  };
}
