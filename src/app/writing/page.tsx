import PageIntro from "@/components/sections/page-intro";
import WritingGrid from "@/components/writing/writing-grid";
import { getAllPosts } from "@/lib/db";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Writing",
  description:
    "Engineering thoughts on shipping real products: AI-assisted development, architecture decisions, and lessons from building things.",
  path: "/writing",
});

export const dynamic = "force-dynamic";

export default async function WritingPage() {
  const posts = await getAllPosts();

  return (
    <>
      <PageIntro
        kicker="Writing"
        title="Engineering Thoughts."
        description="Notes on shipping real products: AI-assisted development, architecture calls, and what building things actually teaches."
      />

      <WritingGrid
        posts={posts}
        className="w-full max-w-275 px-3 pb-16 columns-1 sm:columns-2 lg:columns-3 gap-4"
      />
    </>
  );
}
