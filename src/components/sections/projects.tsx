"use client";

import { RiArrowRightLine } from "@remixicon/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import AboutMeCard from "@/components/bento/cards/about-me-card";
import EkkelesiaCard from "@/components/bento/cards/ekkelesia-card";
import KeipyCard from "@/components/bento/cards/keipy-card";
import QuiroCard from "@/components/bento/cards/quiro-card";
import TechStackCard from "@/components/bento/cards/tech-stack-card";
import ThoughtsCard from "@/components/bento/cards/thoughts-card";

export default function Projects() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="w-full flex flex-col justify-center items-center">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.15 }}
        // Block flow on mobile, grid from `sm` up. A sticky grid item is
        // trapped inside its own grid area and can never travel, so the mobile
        // card deck only works once the cards are ordinary block children of
        // this (tall) container.
        className="w-full max-w-275 block sm:grid grid-flow-dense sm:grid-cols-2 lg:grid-cols-8 mt-10"
      >
        {/* DOM order is also the mobile deck's stacking order. The entrance
            sweeps clockwise around the ring instead — see choreography.ts. */}
        <QuiroCard reduced={reduced} />
        <KeipyCard reduced={reduced} />
        <EkkelesiaCard reduced={reduced} />
        <ThoughtsCard reduced={reduced} />
        <AboutMeCard reduced={reduced} />
        <TechStackCard reduced={reduced} />
      </motion.div>

      <div className="flex justify-end w-full px-8 max-w-275">
        <Link
          href="/projects"
          className="flex group items-center text-base text-secondary transition-colors duration-150 ease hover:text-foreground wrap-break-word hover:underline hover:decoration-2 underline-offset-2 decoration-dotted rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Explore everything
          <RiArrowRightLine className="ml-1.5 w-4 h-auto text-secondary group-hover:text-foreground group-hover:translate-x-0.5 transition-transform duration-300 ease" />
        </Link>
      </div>
    </section>
  );
}
