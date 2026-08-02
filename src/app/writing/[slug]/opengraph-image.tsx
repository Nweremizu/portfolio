import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/db";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-card";

export const alt = "Engineering Thoughts — Nweremizu Bruno";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

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
        background: "#1a1916",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "44%",
          padding: "60px 50px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
            color: "#7e96d3",
            letterSpacing: 1,
          }}
        >
          {post?.date ?? "Writing"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
            marginTop: 18,
          }}
        >
          {post?.title ?? "Engineering Thoughts"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#adadad",
            marginTop: 32,
          }}
        >
          Nweremizu Bruno — Writing
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
    { ...size },
  );
}
