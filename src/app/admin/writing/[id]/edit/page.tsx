import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updatePostAction } from "@/app/admin/actions";
import PostForm from "@/components/admin/post-form";
import { getPostById } from "@/lib/db";

export const metadata: Metadata = {
  title: "Edit post",
  robots: { index: false, follow: false },
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(Number(id));
  if (!post) notFound();

  return (
    <div className="w-full max-w-5xl mx-auto pt-16 pb-24 px-4">
      <h1 className="text-2xl font-medium text-foreground">Edit post</h1>
      <PostForm
        action={updatePostAction.bind(null, post.id)}
        submitLabel="Save"
        defaultValues={post}
      />
    </div>
  );
}
