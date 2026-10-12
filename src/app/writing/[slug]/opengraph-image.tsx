import { ImageResponse } from "next/og";
import Logo from "@/components/ui/logo";
import { formatDate } from "@/lib/date";
import { getPostBySlug } from "@/lib/db";
import {
  OG_BG,
  OG_CONTENT_TYPE,
  OG_FOREGROUND,
  OG_SECONDARY,
  OG_SIZE,
  ogFonts,
} from "@/lib/og-card";

export const alt = "Engineering Thoughts | Nweremizu Bruno";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const LOGO_ASPECT = 364 / 394;
const LOGO_HEIGHT = 44;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: OG_BG,
        fontFamily: "JetBrains Mono",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "44%",
          padding: 56,
        }}
      >
        <Logo
          style={{ height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 400,
              color: OG_SECONDARY,
            }}
          >
            {post ? formatDate(post.date) : "Writing"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              color: OG_FOREGROUND,
              lineHeight: 1.2,
              marginTop: 14,
            }}
          >
            {post?.title ?? "Engineering Thoughts"}
          </div>
        </div>
      </div>

      {post && (
        // biome-ignore lint/performance/noImgElement: satori/ImageResponse rendering, not a browser <img>
        <img
          src={post.coverImage}
          alt=""
          style={{
            width: "56%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>,
    { ...size, fonts: await ogFonts() },
  );
}
