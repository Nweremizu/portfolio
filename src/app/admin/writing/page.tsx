import type { Metadata } from "next";
import Link from "next/link";
import { deletePostAction, logout } from "@/app/admin/actions";
import { getAllPosts } from "@/lib/db";

export const metadata: Metadata = {
  title: "Manage writing",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminWritingPage() {
  const posts = await getAllPosts();

  return (
    <div className="w-full max-w-2xl mx-auto pt-16 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Manage writing</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/writing/new"
            className="rounded-lg bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            New post
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-secondary hover:text-foreground"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <ul className="flex flex-col gap-2 pt-8">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex items-center justify-between gap-4 bg-card rounded-lg px-4 py-3"
          >
            <div className="flex flex-col min-w-0">
              <span className="text-foreground font-medium truncate">
                {post.title}
              </span>
              <span className="text-sm text-secondary">{post.date}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/writing/${post.id}/edit`}
                className="text-sm text-secondary hover:text-foreground"
              >
                Edit
              </Link>
              <form action={deletePostAction}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="text-sm text-secondary hover:text-red-500"
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <p className="text-secondary pt-4">No posts yet.</p>
        )}
      </ul>
    </div>
  );
}
