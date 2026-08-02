"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import ProjectTile from "@/components/bento/cards/project-tile";
import ProjectModal from "@/components/projects/project-modal";
import { gridContainer } from "@/lib/motion";
import { projects } from "@/lib/projects";

export default function ProjectGrid({
  initialOpenSlug,
}: {
  /** Deep-linked via /projects?open=<slug> — e.g. from the homepage bento cards. */
  initialOpenSlug?: string;
}) {
  const reduced = useReducedMotion() ?? false;
  const validInitialSlug = projects.some((p) => p.slug === initialOpenSlug)
    ? (initialOpenSlug as string)
    : null;

  // One modal instance for the whole grid, not one per tile. `openSlug` drives
  // whether it's open; `shownSlug` tracks which project it's showing and is
  // intentionally not cleared on close — it only ever changes to a new,
  // non-null value, so the modal always has content to render while playing
  // its exit transition instead of going blank mid-animation. Selecting a
  // "Related" project inside the open modal sets both at once, which is what
  // makes that transition read as a content swap rather than a close+reopen:
  // `openSlug` never leaves `true`, so react-aria never plays an exit/enter
  // pair — see ProjectModal's own crossfade for the content-level transition.
  const [openSlug, setOpenSlug] = useState<string | null>(validInitialSlug);
  const [shownSlug, setShownSlug] = useState<string | null>(validInitialSlug);

  function openProject(slug: string) {
    setShownSlug(slug);
    setOpenSlug(slug);
  }

  const shownProject = projects.find((p) => p.slug === shownSlug) ?? null;

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={gridContainer}
        // Equal columns and one shared gutter, so every tile is the same size
        // at every breakpoint. p-3 on each tile matches the home grid's rhythm.
        className="w-full max-w-275 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <ProjectTile
            key={project.slug}
            project={project}
            reduced={reduced}
            onOpen={() => openProject(project.slug)}
          />
        ))}
      </motion.div>

      {shownProject && (
        <ProjectModal
          project={shownProject}
          isOpen={openSlug !== null}
          onOpenChange={(open) => !open && setOpenSlug(null)}
          onSelectRelated={openProject}
        />
      )}
    </>
  );
}
