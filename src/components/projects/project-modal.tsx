"use client";

import {
  RiCloseLine,
  RiExternalLinkLine,
  RiGithubFill,
} from "@remixicon/react";
import { animate } from "motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, Heading } from "react-aria-components";
import { Modal } from "@/components/ui/modal";
import { type Project, projects } from "@/lib/projects";

/** The other projects, in order, for the Related rail. */
const relatedTo = (slug: string) => projects.filter((p) => p.slug !== slug);

const linkPillClass =
  "inline-flex items-center gap-1.5 min-h-10 rounded-full border border-secondary/25 bg-card " +
  "px-4 py-2 text-sm font-medium text-secondary transition-[color,border-color,scale] duration-150 ease " +
  "hover:text-foreground hover:border-secondary/45 active:scale-[0.96] focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-primary";

/** One prose block of the case study. Omits itself when there's no copy to show. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-10">
      <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
        {title}
      </h3>
      <div className="pt-3 text-base sm:text-lg text-foreground/90 leading-relaxed max-w-2xl [&_p]:text-pretty [&_p+p]:mt-4">
        {children}
      </div>
    </div>
  );
}

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Swap the modal to another project without closing it. */
  onSelectRelated: (slug: string) => void;
}

// Matches ui/modal.tsx's own entrance curve, so the content-swap crossfade
// and the overlay's open/close animation feel like one system.
const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProjectModal({
  project,
  isOpen,
  onOpenChange,
  onSelectRelated,
}: ProjectModalProps) {
  // What's actually rendered. Deliberately not the same thing as `project`:
  // a Related click changes `project` immediately, but `displayProject` only
  // catches up once the fade-out below has finished, which is what lets the
  // old content stay on screen (and correct) while it fades.
  const [displayProject, setDisplayProject] = useState(project);
  const related = relatedTo(displayProject.slug);
  const { caseStudy } = displayProject;
  const reduced = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLDivElement>(null);

  // Drives the swap by animating the DOM node directly with Motion's
  // imperative `animate()`, instead of an AnimatePresence exit/enter pair
  // keyed on `project.slug`. That mount/unmount approach measurably didn't
  // work here: `ProjectModal` re-rendered correctly with the new project on
  // every Related click (confirmed — it's not a state-management bug), but
  // the old and new `motion.div`s both stayed frozen at their resting
  // opacity, meaning Motion's own animation lifecycle never ran for either
  // one. Whatever's wrong there — this is nested three layers into a React
  // Aria portal, which may be the trigger — animating a ref directly doesn't
  // depend on that lifecycle at all: it's just moving numbers on an element
  // that was already there, so there's nothing for it to get stuck on.
  useEffect(() => {
    if (project.slug === displayProject.slug) return;
    const el = contentRef.current;
    if (!el || reduced) {
      setDisplayProject(project);
      return;
    }

    let cancelled = false;
    animate(
      el,
      { opacity: 0, filter: "blur(4px)" },
      { duration: 0.12, ease: EASE },
    ).then(() => {
      if (cancelled) return;
      setDisplayProject(project);
      // Land back at the top of the new case study — the previous project's
      // scroll position would otherwise carry straight over.
      el.closest('[data-slot="scroll-area-viewport"]')?.scrollTo({ top: 0 });
      animate(
        el,
        { opacity: 1, filter: "blur(0px)" },
        { duration: 0.16, ease: EASE },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [project, displayProject.slug, reduced]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <div ref={contentRef} className="relative p-6 sm:p-10">
        <Button
          slot="close"
          aria-label="Close"
          className="absolute top-5 right-5 grid place-items-center size-10 rounded-full border border-secondary/25 bg-card text-secondary transition-[color,scale] duration-150 ease-out hover:text-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
        >
          <RiCloseLine className="size-4" />
        </Button>

        <div className="grid gap-8 sm:grid-cols-[1fr_1.4fr] sm:gap-10 pr-12 sm:pr-14">
          <div className="flex flex-col">
            <p className="text-sm text-secondary">{displayProject.kicker}</p>
            {/* Must be react-aria's <Heading slot="title">, not a raw
                <h2 slot="title">: the slot is wired through RAC's context, so
                a plain element renders the attribute but never labels the
                dialog. This is what gives the dialog its accessible name —
                there's no DialogTrigger here to fall back to. */}
            <Heading
              slot="title"
              level={2}
              className="text-4xl sm:text-5xl font-semibold text-primary leading-tight pt-1 text-balance"
            >
              {displayProject.title}
            </Heading>
            <p className="text-base font-medium text-primary-dark dark:text-primary pt-1">
              {displayProject.description}
            </p>
            <p className="text-sm text-secondary pt-2 tabular-nums">
              {displayProject.year}
            </p>

            {displayProject.stack.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-5">
                {displayProject.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-secondary/20 bg-background px-3 py-1 text-xs font-medium text-secondary"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative rounded-xl bg-background overflow-hidden aspect-video">
            <img
              src={displayProject.image}
              alt={`${displayProject.title} preview`}
              className="absolute inset-0 h-full w-full object-contain outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]"
            />
          </div>
        </div>

        <p className="text-lg sm:text-xl text-foreground leading-relaxed text-pretty pt-10 max-w-2xl">
          {displayProject.summary}
        </p>

        {(displayProject.links?.demo || displayProject.links?.github) && (
          <div className="flex flex-wrap gap-3 pt-6">
            {displayProject.links?.demo && (
              <a
                href={displayProject.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className={linkPillClass}
              >
                <RiExternalLinkLine className="size-4" />
                Visit site
              </a>
            )}
            {displayProject.links?.github && (
              <a
                href={displayProject.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={linkPillClass}
              >
                <RiGithubFill className="size-4" />
                Source
              </a>
            )}
          </div>
        )}

        <div className="h-px w-full bg-secondary/20 mt-10" />

        <Section title="The Problem">
          <p>{caseStudy.problem}</p>
        </Section>

        <Section title="The Challenge">
          <p>{caseStudy.challenge}</p>
        </Section>

        <Section title="Architecture & Decisions">
          <p>{caseStudy.architecture}</p>
          {caseStudy.decisions.length > 0 && (
            <ul className="mt-4 list-disc space-y-1.5 pl-5 marker:text-secondary">
              {caseStudy.decisions.map((decision, i) => (
                <li key={i}>{decision}</li>
              ))}
            </ul>
          )}
        </Section>

        {caseStudy.whatWentWrong && (
          <Section title="What Went Wrong">
            <p>{caseStudy.whatWentWrong}</p>
          </Section>
        )}

        <Section title="What I Learned">
          <p>{caseStudy.lessons}</p>
        </Section>

        {related.length > 0 && (
          <>
            <div className="h-px w-full bg-secondary/20 mt-10" />
            <h3 className="text-2xl font-semibold pt-8">Related</h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-5">
              {related.map((p) => (
                <li
                  key={p.slug}
                  className="group relative rounded-xl bg-background overflow-hidden"
                >
                  <div className="p-5">
                    <p className="text-sm text-secondary">{p.kicker}</p>
                    <p className="text-lg font-semibold pt-0.5 text-balance">
                      {p.title}
                    </p>
                    <p className="text-sm text-secondary pt-0.5">
                      {p.description}
                    </p>
                  </div>
                  <div className="relative h-32 mx-5 mb-5 overflow-hidden rounded-lg">
                    <img
                      src={p.image}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-contain object-top pointer-events-none outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)] transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  {/* Stretched hit target, same pattern as ProjectTile: a
                      <button> can't legally contain the <p> title above it,
                      so the press target is a separate, covering element. */}
                  <Button
                    onPress={() => onSelectRelated(p.slug)}
                    aria-label={`${p.title} — ${p.description}`}
                    className="absolute inset-0 z-10 cursor-pointer rounded-xl transition-transform duration-150 ease-out pressed:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  );
}
