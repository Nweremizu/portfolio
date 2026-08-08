"use client";

import { RiArrowRightUpLine } from "@remixicon/react";
import { motion } from "motion/react";
import { Button } from "react-aria-components";
import { gridItem } from "@/lib/motion";
import type { Project } from "@/lib/projects";

/**
 * One tile in the uniform projects grid. Every tile is the same size and shape,
 * so all the variation lives in the content rather than the layout.
 *
 * There's no DialogTrigger here: the modal is a single shared instance owned
 * by ProjectGrid (see project-grid.tsx), so that clicking a "Related" project
 * inside an open modal can swap its content without closing and reopening the
 * overlay. `onOpen` just tells that shared owner which project to show.
 *
 * The trigger is a stretched <Button> rather than a wrapper around the whole
 * card: a <button> may only contain phrasing content, so wrapping the <h3>
 * would be invalid HTML and would flatten the heading out of the document
 * outline.
 */
export default function ProjectTile({
  project,
  reduced,
  onOpen,
}: {
  project: Project;
  reduced: boolean;
  onOpen: () => void;
}) {
  return (
    <motion.div variants={gridItem(reduced)} className="p-3">
      <article className="group relative flex flex-col h-full aspect-4/3 bg-card rounded-xl overflow-hidden">
        <div className="relative flex items-start justify-between gap-4 p-6 pb-4">
          <div className="flex flex-col gap-y-px">
            <p className="text-sm text-secondary">{project.kicker}</p>
            <h3 className="text-2xl leading-tight font-semibold text-balance pt-0.5">
              {project.title}
            </h3>
            <p className="text-sm text-secondary pt-0.5">
              {project.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-secondary tabular-nums">
              {project.year}
            </span>
            <RiArrowRightUpLine className="w-4 h-4 text-secondary transition-[color,translate] duration-300 ease-out group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* h-full/w-full are required: `inset-0` alone leaves a replaced
            element at its intrinsic size. */}
        <div className="relative flex-1 mx-6 mt-2 overflow-hidden rounded-t-lg">
          <img
            loading="lazy"
            alt={`${project.title} preview`}
            src={project.image}
            className="absolute inset-0 h-full w-full object-contain object-top pointer-events-none  -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>

        {/* Covers the card so the whole surface is the hit target, while the
            heading above keeps its semantics. */}
        <Button
          onPress={onOpen}
          aria-label={`${project.title} — ${project.description}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl transition-transform duration-150 ease-out pressed:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        />
      </article>
    </motion.div>
  );
}
