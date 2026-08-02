import type { Metadata } from "next";
import { createPostAction } from "@/app/admin/actions";
import PostForm from "@/components/admin/post-form";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div className="w-full max-w-5xl mx-auto pt-16 pb-24 px-4">
      <h1 className="text-2xl font-medium text-foreground">New post</h1>
      <PostForm action={createPostAction} submitLabel="Publish" />
    </div>
  );
}
