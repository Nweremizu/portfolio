import type { Metadata } from "next";
import { socials } from "@/lib/socials";

/** Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL once this is deployed. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Nweremizu Bruno";
export const SITE_DESCRIPTION =
  "Full-stack developer building practical products — from AI-powered tools to desktop, mobile, and web applications.";
export const TWITTER_HANDLE = socials.X.replace("https://x.com/", "@");

/** Consistent title/description/OG/Twitter/canonical for a static route. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      creator: TWITTER_HANDLE,
      title,
      description,
    },
  };
}
