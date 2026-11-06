import { List, ProductCard, Row, Section } from "@/components/list";
import { intro } from "@/lib/content";
import { formatShortDate } from "@/lib/date";
import { getAllPosts } from "@/lib/db";
import { projects } from "@/lib/projects";
import { socials } from "@/lib/socials";

export const dynamic = "force-dynamic";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default async function Home() {
  const posts = (await getAllPosts()).slice(0, 4);
  const products = projects.filter((p) => !p.hobby);

  return (
    <>
      <section>
        <h1
          className="rise text-balance text-[2.125rem] leading-[1.1] font-medium tracking-[-0.025em] text-foreground sm:text-[2.75rem]"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          {intro.headline[0]}{" "}
          <span className="font-serif font-normal tracking-normal italic">
            {intro.headline[1]}
          </span>
        </h1>
        <div
          className="rise mt-6 max-w-[34rem] space-y-4"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          {intro.paragraphs.map((p, i) => (
            <p
              key={p}
              // The plot sizes the first line down to its measure.
              data-plot-measure={i === 0 || undefined}
              className="text-pretty text-secondary"
            >
              {p}
            </p>
          ))}
        </div>
        <div
          className="rise mt-8 flex flex-wrap gap-3"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <a href={socials.Gmail} className="btn btn-primary">
            Get in touch
          </a>
          <a href={socials.GitHub} {...external} className="btn btn-secondary">
            GitHub ↗
          </a>
          <a
            href={socials.LinkedIn}
            {...external}
            className="btn btn-secondary"
          >
            LinkedIn ↗
          </a>
        </div>
      </section>

      <Section label="Products" i={4}>
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2">
          {products.map((p, idx) => (
            <ProductCard key={p.slug} {...p} feature={idx === 0} />
          ))}
        </div>
      </Section>

      {posts.length > 0 && (
        <Section
          label="Writing"
          i={5}
          action={{ href: "/writing", label: "All writing →" }}
        >
          <List>
            {posts.map((post) => (
              <Row
                key={post.slug}
                href={`/writing/${post.slug}`}
                title={post.title}
                meta={formatShortDate(post.date)}
              />
            ))}
          </List>
        </Section>
      )}
    </>
  );
}
