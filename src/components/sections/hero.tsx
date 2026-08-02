"use client";

import { motion } from "motion/react";
import { hero } from "@/lib/content";
import { EASE } from "@/lib/motion";

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -18, scale: 0.98, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="flex flex-col items-center justify-center gap-4.5 py-12 px-6 font-sans"
    >
      <p className="text-accent text-xs sm:text-sm">{hero.greeting}</p>
      <h1 className="text-4xl sm:text-5xl font-medium text-primary">
        {hero.name}
      </h1>
      <h1 className="text-4xl sm:text-5xl font-medium text-primary-dark text-center">
        {hero.headline[0]} <br />
        {hero.headline[1]}
      </h1>
      <h2 className="text-xl sm:text-2xl font-medium text-accent">
        {hero.role}
      </h2>
    </motion.section>
  );
}
