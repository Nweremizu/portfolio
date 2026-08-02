import Link from "next/link";
import DitheredCover from "@/components/writing/dithered-cover";
import type { Post } from "@/lib/db";

const ASPECTS = ["aspect-[4/5]", "aspect-square", "aspect-[4/3]"];

export default function WritingCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  return (
    <Link
      href={`/writing/${post.slug}`}
      className="group block break-inside-avoid mb-4 bg-card rounded-xl overflow-hidden transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="p-5">
        <p className="text-sm text-secondary">Writing</p>
        <h2 className="text-lg font-semibold text-foreground pt-1 group-hover:underline decoration-2 decoration-dotted underline-offset-4">
          {post.title}
        </h2>
      </div>
      <div className={`relative ${ASPECTS[index % ASPECTS.length]}`}>
        <div className="absolute inset-0">
          <DitheredCover src={post.coverImage} alt={post.title} />
        </div>
      </div>
    </Link>
  );
}
