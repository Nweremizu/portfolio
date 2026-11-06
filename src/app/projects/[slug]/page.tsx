import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return {};
  return pageMetadata({
    title: p.title,
    description: p.summary,
    path: `/projects/${p.slug}`,
  });
}

/** Label in its own column on wide screens, stacked above on narrow ones. */
function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 border-t border-border pt-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
      <h2 className="font-mono text-xs leading-6 text-secondary">{title}</h2>
      <div className="space-y-4 text-pretty text-foreground/85">{children}</div>
    </section>
  );
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const cs = p.caseStudy;

  return (
    <article>
      <Link
        href="/"
        data-sound="navigation.backward"
        className="rise inline-flex h-8 items-center font-mono text-xs text-secondary transition-colors duration-150 hover:text-foreground"
      >
        ← Index
      </Link>

      <header className="rise mt-8" style={{ "--i": 1 } as React.CSSProperties}>
        <p className="font-mono text-xs text-secondary">
          {p.kicker} · {p.year}
        </p>
        <h1 className="mt-3 text-balance text-[2.125rem] leading-[1.1] font-medium tracking-[-0.025em] text-foreground sm:text-[2.75rem]">
          {p.title}{" "}
          <span className="font-serif font-normal tracking-normal text-secondary italic">
            {p.description.toLowerCase()}
          </span>
        </h1>
        <p className="mt-6 max-w-[34rem] text-pretty text-secondary">
          {p.summary}
        </p>

        {(p.links?.demo || p.links?.github) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.demo && (
              <a href={p.links.demo} {...external} className="btn btn-primary">
                Visit ↗
              </a>
            )}
            {p.links.github && (
              <a
                href={p.links.github}
                {...external}
                className="btn btn-secondary"
              >
                Source ↗
              </a>
            )}
          </div>
        )}
      </header>

      <div
        className="rise relative mt-12 aspect-[16/10] overflow-hidden rounded-xl bg-card outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]"
        style={{ "--i": 2 } as React.CSSProperties}
      >
        <Image
          src={p.image}
          alt={`${p.title} screenshot`}
          fill
          priority
          sizes="(min-width: 40rem) 40rem, 100vw"
          className="object-cover object-top"
        />
      </div>

      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Stack">
        {p.stack.map((t) => (
          <li
            key={t}
            className="rounded-full bg-card px-2.5 py-1 font-mono text-xs text-secondary"
          >
            {t}
          </li>
        ))}
      </ul>

      {p.gallery && (
        <section aria-label="Screens" className="mt-12">
          {/* Scrolls sideways; the next screen peeks past the edge as the cue. */}
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6">
            {p.gallery.map((g) => (
              <Image
                key={g.src}
                src={g.src}
                alt={g.alt}
                width={g.width}
                height={g.height}
                sizes="(min-width: 640px) 500px, 70vw"
                className="h-96 w-auto shrink-0 snap-start rounded-xl outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] sm:h-[28rem] dark:outline-[oklch(1_0_0/0.1)]"
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 space-y-12">
        <Block title="Problem">
          <p>{cs.problem}</p>
        </Block>
        <Block title="Challenge">
          <p>{cs.challenge}</p>
        </Block>
        <Block title="Architecture">
          <p>{cs.architecture}</p>
        </Block>
        <Block title="Decisions">
          <ul className="list-disc space-y-3 ps-5 marker:text-secondary">
            {cs.decisions.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </Block>
        {cs.whatWentWrong && (
          <Block title="What went wrong">
            <p>{cs.whatWentWrong}</p>
          </Block>
        )}
        <Block title="Lessons">
          <p>{cs.lessons}</p>
        </Block>
      </div>
    </article>
  );
}
