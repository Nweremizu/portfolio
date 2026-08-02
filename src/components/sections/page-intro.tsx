"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * The heading block a sub-page opens with. Uses the same rise-and-rack as the
 * home hero so arriving on a second page feels like the same site, and leads
 * the grid below it by a beat.
 */
export default function PageIntro({
  kicker,
  title,
  description,
  variant = "default",
}: {
  kicker: string;
  title: string;
  description?: string;
  /** "post" trades the grid-width layout for a narrower, colored article headline. */
  variant?: "default" | "post";
}) {
  const reduced = useReducedMotion() ?? false;
  const isPost = variant === "post";

  return (
    <motion.header
      initial={
        reduced ? { opacity: 0 } : { opacity: 0, y: -14, filter: "blur(4px)" }
      }
      animate={
        reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      transition={{ duration: reduced ? 0.3 : 0.7, ease: EASE }}
      className={
        isPost
          ? "w-full max-w-175 px-3 pt-12 pb-6"
          : "w-full max-w-275 px-3 pt-12 pb-6"
      }
    >
      <p className="text-accent text-xs sm:text-sm">{kicker}</p>
      <h1
        className={
          isPost
            ? "text-4xl sm:text-6xl font-semibold text-primary pt-2 text-balance"
            : "text-4xl sm:text-5xl font-medium text-foreground pt-2"
        }
      >
        {title}
      </h1>
      {description && (
        <p className="text-base sm:text-lg text-secondary pt-3 max-w-xl">
          {description}
        </p>
      )}
    </motion.header>
  );
}
