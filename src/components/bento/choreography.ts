/**
 * The bento entrance and mobile deck, as one table.
 *
 * The tiles ring a hub (`me`, at the grid's centre), and each enters from
 * further out along its own radial vector. `delay` sweeps clockwise around
 * that ring starting from the right, which is why the order here is not DOM
 * order. Keeping every card's numbers side by side is the only way the
 * choreography stays legible — spread across six files it becomes guesswork.
 *
 * `stack` is the card's index in the mobile sticky deck, which *is* DOM order.
 */
export const choreography = {
  quiro: { vector: [-13, -10], delay: 0.325, stack: 0 },
  keipy: { vector: [9, -13], delay: 0.39, stack: 1 },
  ekkelesia: { vector: [16, 0], delay: 0.13, stack: 2 },
  thoughts: { vector: [-16, 3], delay: 0.26, stack: 3 },
  me: { vector: [0, 0], delay: 0, stack: 4 }, // hub: fades, never travels
  techStack: { vector: [-7, 14], delay: 0.195, stack: 5 },
} as const satisfies Record<
  string,
  { vector: readonly [number, number]; delay: number; stack: number }
>;

export type CardKey = keyof typeof choreography;
