"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { hubMotion, stackTop, tileMotion } from "@/lib/motion";
import { type CardKey, choreography } from "./choreography";

interface BentoCardProps {
  /** Which entry in the choreography table this card animates on. */
  card: CardKey;
  /** Grid placement + the card's mobile deck rotation. */
  className?: string;
  href?: string;
  reduced: boolean;
  children: React.ReactNode;
}

/**
 * The shell every bento card shares: the animated grid cell, the sticky deck
 * behaviour, the link, and the rounded surface. Cards supply only their
 * contents and their own grid placement.
 */
export default function BentoCard({
  card,
  className,
  href = "#",
  reduced,
  children,
}: BentoCardProps) {
  const { vector, delay, stack } = choreography[card];

  return (
    <motion.div
      id={card}
      variants={
        card === "me"
          ? hubMotion(reduced)
          : tileMotion(vector[0], vector[1], delay, reduced)
      }
      style={stackTop(stack)}
      // `sticky sm:static` is the mobile deck. It only works because the grid
      // container is block-flow on mobile — a sticky *grid item* is trapped in
      // its own grid area and can never travel.
      className={cn("sticky sm:static p-3", className)}
    >
      <Link href={href} className="h-full rounded-xl">
        <div className="group relative flex flex-col items-stretch h-full bg-card rounded-xl overflow-hidden">
          {children}
        </div>
      </Link>
    </motion.div>
  );
}
