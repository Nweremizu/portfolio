import { marked } from "marked";
import { PROSE_CLASS } from "@/lib/prose";

export interface PreviewValues {
  title: string;
  date: string;
  body: string;
  coverImage: string;
  coverCreditName: string;
  coverCreditUrl: string;
}

/** Mirrors /writing/[slug]'s markup so a draft looks like the real post. */
export default function PostPreview({ values }: { values: PreviewValues }) {
  const html = values.body ? (marked.parse(values.body) as string) : "";

  return (
    <div className="rounded-xl bg-card p-6 overflow-hidden">
      <p className="text-accent text-xs sm:text-sm">
        {values.date || "Publish date"}
      </p>
      <h1 className="text-3xl font-semibold text-primary leading-tight pt-2 text-balance">
        {values.title || "Post title"}
      </h1>

      {values.coverImage && (
        // biome-ignore lint/performance/noImgElement: remote Unsplash photo, no local optimization pipeline for it
        <img
          src={values.coverImage}
          alt=""
          className="w-full rounded-xl aspect-video object-cover mt-4"
        />
      )}
      {values.coverCreditName && (
        <p className="text-sm text-secondary pt-2 italic">
          Photo by {values.coverCreditName}
        </p>
      )}

      {html ? (
        <div
          className={PROSE_CLASS}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: previewing the admin's own draft, mirrors the same trusted render path as the live post.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-secondary pt-6">Start writing to see a preview…</p>
      )}
    </div>
  );
}
