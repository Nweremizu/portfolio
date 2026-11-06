import { List, Row } from "@/components/list";
import { formatShortDate } from "@/lib/date";
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
    <div className="rise">
      <h1 className="text-balance text-[2.125rem] leading-[1.1] font-medium tracking-[-0.025em] text-foreground sm:text-[2.75rem]">
        Writing{" "}
        <span className="font-serif font-normal tracking-normal text-secondary italic">
          on shipping real products.
        </span>
      </h1>
      <p className="mt-6 max-w-[34rem] text-pretty text-secondary">
        AI-assisted development, architecture calls, and what building things
        actually teaches.
      </p>
      <div className="mt-14">
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
      </div>
    </div>
  );
}
