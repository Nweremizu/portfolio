import { marked } from "marked";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageIntro from "@/components/sections/page-intro";
import WritingCard from "@/components/writing/writing-card";
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
    <>
      <PageIntro kicker={post.date} title={post.title} variant="post" />

      <div className="w-full max-w-175 px-3">
        {/* biome-ignore lint/performance/noImgElement: remote Unsplash photo, no local optimization pipeline for it */}
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full rounded-xl aspect-video object-cover"
        />
        <p className="text-sm text-secondary pt-2 italic">
          Photo by{" "}
          <a
            href={post.coverCreditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted"
          >
            {post.coverCreditName}
          </a>{" "}
          on{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted"
          >
            Unsplash
          </a>
        </p>
      </div>

      <article
        className={`w-full max-w-175 px-3 pb-16 ${PROSE_CLASS}`}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: body is authored only through the password-gated admin page, not user-submitted.
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {related.length > 0 && (
        <div className="w-full max-w-175 px-3 pb-24">
          <div className="border-t border-secondary/20 pt-8">
            <h2 className="text-2xl font-semibold text-foreground pb-4">
              Related
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {related.map((p, index) => (
                <WritingCard key={p.slug} post={p} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
