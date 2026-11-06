import { marked } from "marked";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { List, Row } from "@/components/list";
import { formatDate } from "@/lib/date";
import { getAllPosts, getPostBySlug } from "@/lib/db";
import { SITE_NAME, TWITTER_HANDLE } from "@/lib/metadata";
import { PROSE_CLASS } from "@/lib/prose";

export const dynamic = "force-dynamic";

/** Plain-text lede for meta descriptions and social previews. */
function excerpt(markdown: string, length = 160): string {
  const text = markdown
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const description = excerpt(post.body);
  const path = `/writing/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description,
      url: path,
      type: "article",
      publishedTime: post.date,
      authors: [SITE_NAME],
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_HANDLE,
      title: post.title,
      description,
    },
  };
}

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [html, allPosts] = await Promise.all([
    marked.parse(post.body),
    getAllPosts(),
  ]);
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="rise">
      <Link
        href="/writing"
        data-sound="navigation.backward"
        className="font-mono text-xs text-secondary transition-colors hover:text-foreground"
      >
        ← Writing
      </Link>
      <h1 className="mt-8 text-balance text-[1.875rem] leading-[1.15] font-medium tracking-[-0.02em] text-foreground sm:text-[2.25rem]">
        {post.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-secondary">
        {formatDate(post.date)}
      </p>

      <figure className="mt-10">
        {/* biome-ignore lint/performance/noImgElement: remote Unsplash photo, no local optimization pipeline for it */}
        <img
          src={post.coverImage}
          alt=""
          className="aspect-video w-full rounded-xl object-cover outline outline-1 -outline-offset-1 outline-[oklch(0_0_0/0.1)] dark:outline-[oklch(1_0_0/0.1)]"
        />
        <figcaption className="mt-2 font-mono text-xs text-secondary">
          Photo by{" "}
          <a
            href={post.coverCreditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {post.coverCreditName}
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Unsplash
          </a>
        </figcaption>
      </figure>

      <div
        className={`mt-6 ${PROSE_CLASS}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: body is authored only through the password-gated admin page, not user-submitted.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-3 font-mono text-xs text-secondary">
            More writing
          </h2>
          <List>
            {related.map((p) => (
              <Row
                key={p.slug}
                href={`/writing/${p.slug}`}
                title={p.title}
                meta={formatDate(p.date)}
              />
            ))}
          </List>
        </section>
      )}
    </article>
  );
}
