"use client";

import { motion, useReducedMotion } from "motion/react";
import WritingCard from "@/components/writing/writing-card";
import type { Post } from "@/lib/db";
import { gridContainer, gridItem } from "@/lib/motion";

/** Staggered entrance for a set of posts, matching the projects grid's cadence. */
export default function WritingGrid({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={gridContainer}
      className={className}
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.slug}
          variants={gridItem(reduced)}
          className="break-inside-avoid"
        >
          <WritingCard post={post} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
}
