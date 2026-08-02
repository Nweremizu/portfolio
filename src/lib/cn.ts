import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, with later Tailwind utilities winning. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Wraps a class-name lookup table so a typo throws instead of silently
 * rendering an element with no styles.
 */
export function sortCx(classes: Record<string, string>) {
  return new Proxy(classes, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop];
      }
      throw new Error(
        `Class "${prop}" does not exist in the provided classes.`,
      );
    },
  });
}
