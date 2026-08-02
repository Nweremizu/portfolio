"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearLoginAttempts,
  createSessionToken,
  isLoginRateLimited,
  recordFailedLogin,
  SESSION_COOKIE,
} from "@/lib/auth";
import { createPost, deletePost, updatePost } from "@/lib/db";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isLoginRateLimited(ip)) {
    redirect("/admin/login?error=1");
  }

  if (!checkPassword(password)) {
    recordFailedLogin(ip);
    redirect("/admin/login?error=1");
  }
  clearLoginAttempts(ip);

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/admin/writing");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function postFromForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    coverImage: String(formData.get("coverImage") ?? "").trim(),
    coverCreditName: String(formData.get("coverCreditName") ?? "").trim(),
    coverCreditUrl: String(formData.get("coverCreditUrl") ?? "").trim(),
  };
}

export async function createPostAction(formData: FormData) {
  await createPost(postFromForm(formData));
  redirect("/admin/writing");
}

export async function updatePostAction(id: number, formData: FormData) {
  await updatePost(id, postFromForm(formData));
  redirect("/admin/writing");
}

export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  await deletePost(id);
  redirect("/admin/writing");
}
