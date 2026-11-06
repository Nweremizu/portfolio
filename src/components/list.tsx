import Image from "next/image";
import Link from "next/link";

/** A labelled block of the page. `i` is its place in the entrance sequence. */
export function Section({
  label,
  i,
  action,
  children,
}: {
  label: string;
  i: number;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section
      className="rise mt-24 sm:mt-28"
      style={{ "--i": i } as React.CSSProperties}
    >
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-xs text-secondary">{label}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-sm text-secondary transition-colors duration-150 hover:text-foreground"
          >
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * One line of an index: title, right-aligned meta. Siblings dim while one is
 * hovered, so the eye lands on the row under the cursor.
 */
export function Row({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      data-sound="navigation.forward"
      data-sound-hover
      className="-mx-3 flex items-baseline gap-4 rounded-lg px-3 py-2.5 transition-[opacity,background-color] duration-150 group-hover/list:opacity-50 hover:bg-card hover:!opacity-100"
    >
      <span className="min-w-0 text-pretty text-foreground">{title}</span>
      <span className="ms-auto shrink-0 font-mono text-xs text-secondary tabular-nums">
        {meta}
      </span>
    </Link>
  );
}

export function List({ children }: { children: React.ReactNode }) {
  return <div className="group/list flex flex-col">{children}</div>;
}

/** Screenshot-led product card. `feature` gives it the wide crop. */
export function ProductCard({
  slug,
  title,
  description,
  kicker,
  year,
  image,
  feature = false,
}: {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  year: string;
  image: string;
  feature?: boolean;
}) {
  return (
    <Link
      href={`/projects/${slug}`}
      data-sound="navigation.forward"
      data-sound-hover
      className={`group block ${feature ? "sm:col-span-2" : ""}`}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-card outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)] ${
          feature ? "aspect-[16/9]" : "aspect-[16/10]"
        }`}
      >
        <Image
          src={image}
          alt={`${title} screenshot`}
          fill
          loading={feature ? "eager" : undefined}
          sizes={
            feature
              ? "(min-width: 40rem) 40rem, 100vw"
              : "(min-width: 40rem) 20rem, 100vw"
          }
          className="object-cover object-top transition-[scale] duration-300 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-sm text-secondary">{kicker}</span>
        <span className="ms-auto shrink-0 font-mono text-xs text-secondary tabular-nums">
          {year}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-secondary">{description}</p>
    </Link>
  );
}
