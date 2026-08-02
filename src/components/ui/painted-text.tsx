"use client";

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Fragment, useMemo, useRef } from "react";

// How many words are mid-fade at any instant. 1 would read as hard on/off
// flicks; much above 4 and the boundary smears into a wash. 3 keeps it
// legibly word-by-word while still feeling continuous.
const SPREAD = 3;

// Each word crossfades as a single unit between `dim` and full opacity. It is
// opacity rather than colour because opacity is the one property that composites
// on the GPU, and because holding the text at `color: var(--foreground)` keeps
// the effect reactive to the theme — interpolating between two CSS variables
// isn't something Motion can do.
//
// Why 0.6 reads as the muted tone in *both* themes:
//   light: 26 over 245 -> 245 - 219(0.6) = 114  (--secondary is 112)
//   dark: 237 over  83 ->  83 + 154(0.6) = 175  (--secondary is 173)
const DIM = 0.6;

const DEFAULT_LINK_CLASS =
  "underline decoration-dotted decoration-2 underline-offset-4 transition-colors duration-150 ease hover:text-primary";

/**
 * Renders one whitespace-delimited token, turning it into a link when it
 * matches a key in `links`. Trailing punctuation is kept outside the anchor so
 * "Gmail." underlines the word but not the full stop.
 */
function WordContent({
  word,
  links,
  linkClassName,
}: {
  word: string;
  links?: Record<string, string>;
  linkClassName: string;
}) {
  const core = word.replace(/[^\p{L}\p{N}]+$/u, "");
  const href = links?.[core];
  if (!href) return <>{word}</>;

  const external = /^https?:/i.test(href);
  return (
    <>
      <a
        href={href}
        className={linkClassName}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : null)}
      >
        {core}
      </a>
      {word.slice(core.length)}
    </>
  );
}

function Word({
  text,
  index,
  total,
  progress,
  dim,
  links,
  linkClassName,
}: {
  text: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  dim: number;
  links?: Record<string, string>;
  linkClassName: string;
}) {
  const opacity = useTransform(progress, (v) => {
    const t = (v * (total + SPREAD) - index) / SPREAD;
    const c = t < 0 ? 0 : t > 1 ? 1 : t;
    // Smoothstep rather than linear: this is scroll-linked, so easing both
    // ends stops each word arriving and finishing on a hard corner.
    return dim + (1 - dim) * (c * c * (3 - 2 * c));
  });

  return (
    <motion.span data-painted-word style={{ opacity }}>
      <WordContent word={text} links={links} linkClassName={linkClassName} />
    </motion.span>
  );
}

interface PaintedTextProps {
  /** One string per paragraph. Words are painted in document order across all of them. */
  paragraphs: string[];
  /** Applied to every <p>. All typography is inherited — this component sets none. */
  className?: string;
  /** Applied to the box holding the paragraphs, e.g. the max-width column. */
  contentClassName?: string;
  /**
   * Height of the scroll track, in viewport heights. The paint is spread over
   * `(trackScreens - 1)` screens of scrolling, so 2.5 spends 1.5 screens'
   * worth. Raise it to make the paint slower and more deliberate.
   */
  trackScreens?: number;
  /** Opacity of not-yet-painted words, 0–1. Lower = stronger contrast between states. */
  dim?: number;
  /**
   * Word -> href. Any word in the copy matching a key becomes a link, ignoring
   * trailing punctuation. `https:` hrefs open in a new tab; anything else
   * (`mailto:`, internal paths) navigates in place.
   */
  links?: Record<string, string>;
  /** Overrides the default dotted-underline link styling. */
  linkClassName?: string;
}

export default function PaintedText({
  paragraphs,
  className,
  contentClassName,
  trackScreens = 2.5,
  dim = DIM,
  links,
  linkClassName = DEFAULT_LINK_CLASS,
}: PaintedTextProps) {
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // The text pins to the middle of the screen while this track scrolls past
  // it, which is what buys the effect its scroll budget. Mapping the paint to
  // the block's own passage through the viewport instead looks instant: the
  // block is only on screen for a few hundred pixels of scroll, so the paint
  // is over before the copy is comfortably readable.
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  // Split once, and give every word a running index so the paint continues
  // unbroken from one paragraph into the next.
  const { split, total, starts } = useMemo(() => {
    const split = paragraphs.map((p) => p.split(" "));
    const starts: number[] = [];
    let n = 0;
    for (const words of split) {
      starts.push(n);
      n += words.length;
    }
    return { split, total: n, starts };
  }, [paragraphs]);

  // Reduced motion: no pin, no scroll-linked fade — just the finished state in
  // normal flow. Pinning without the payoff is only a long empty scroll, so
  // the track is dropped entirely.
  if (reduced) {
    return (
      <div className={contentClassName}>
        {split.map((words, pi) => (
          <p key={pi} className={className}>
            {words.map((word, wi) => (
              <Fragment key={wi}>
                <WordContent
                  word={word}
                  links={links}
                  linkClassName={linkClassName}
                />
                {wi < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
    );
  }

  return (
    // Pinned at every breakpoint. This only stays correct while the copy is
    // shorter than the viewport: `items-center` centres any overflow, so text
    // taller than `h-screen` spills out of the *top* of this box and paints
    // over whatever section precedes it. That is why the caller drops the
    // mobile type size — see the note on `className` in page.tsx.
    <div ref={track} style={{ height: `${trackScreens * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center justify-center">
        <div className={contentClassName}>
          {split.map((words, pi) => (
            <p key={pi} className={className}>
              {words.map((word, wi) => (
                <Fragment key={wi}>
                  <Word
                    text={word}
                    index={starts[pi] + wi}
                    total={total}
                    progress={scrollYProgress}
                    dim={dim}
                    links={links}
                    linkClassName={linkClassName}
                  />
                  {/* A real space text node, outside the span, so wrapping and
                      word-spacing behave exactly as they do in plain text. */}
                  {wi < words.length - 1 ? " " : null}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
