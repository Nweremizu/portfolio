/**
 * Shared motion vocabulary. Keeping the curve and durations in one place is
 * what makes the hero, the bento entrance and the footer read as one system
 * rather than three separate animations.
 */

/** Expo-out. The built-in CSS easings are too weak to feel intentional. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const RING_DURATION = 0.75;
export const HUB_DURATION = 0.55;
export const ENTER_BLUR = "blur(4px)";

/** Reduced motion: opacity only — no travel, no blur. */
export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: EASE } },
};

/**
 * A bento tile entering from `x`/`y` px further out along its own radial
 * vector, measured from the grid's centre at the lg breakpoint. The travel is
 * deliberately short — the blur-to-sharp rack, not the distance, carries the
 * entrance.
 */
export const tileMotion = (
  x: number,
  y: number,
  delay: number,
  reduced: boolean,
) =>
  reduced
    ? reducedMotionVariants
    : {
        hidden: { opacity: 0, x, y, filter: ENTER_BLUR },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: RING_DURATION, delay, ease: EASE },
          // Drop the filter once settled. A lingering `blur(0px)` is visually a
          // no-op but still forces a stacking context and its own compositing
          // layer, which can soften text antialiasing permanently.
          transitionEnd: { filter: "none" },
        },
      };

/** The hub tile at the centre of the ring: it fades, it does not travel. */
export const hubMotion = (reduced: boolean) =>
  reduced
    ? reducedMotionVariants
    : {
        hidden: { opacity: 0, filter: ENTER_BLUR },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: HUB_DURATION, ease: EASE },
          transitionEnd: { filter: "none" },
        },
      };

/**
 * A uniform grid's entrance. Unlike the bento ring — whose tiles each need
 * their own radial vector — equal tiles read best as a plain stagger, because
 * DOM order already is visual order. `staggerChildren` derives the sequence
 * itself, so adding a project needs no new numbers.
 *
 * 55ms sits mid-range of the 30–80ms that reads as a cascade rather than a
 * queue.
 */
export const GRID_STAGGER = 0.055;
export const GRID_ITEM_DURATION = 0.55;

export const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: GRID_STAGGER } },
};

export const gridItem = (reduced: boolean) =>
  reduced
    ? reducedMotionVariants
    : {
        hidden: { opacity: 0, y: 14, filter: ENTER_BLUR },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: GRID_ITEM_DURATION, ease: EASE },
          transitionEnd: { filter: "none" },
        },
      };

/**
 * Mobile-only stacked deck. Each card sticks slightly lower than the one
 * before it, so scrolling piles them up with every buried card's top edge
 * still peeking out. Nothing releases them explicitly: a sticky element can't
 * escape its containing block, so the deck lifts away on its own once the grid
 * ends.
 *
 * The step has to clear the p-3 gutter (12px) to expose any actual card edge —
 * at 30px that leaves ~18px of card visible per layer.
 */
export const STACK_TOP = 16;
export const STACK_STEP = 30;
export const stackTop = (i: number) => ({ top: STACK_TOP + i * STACK_STEP });
