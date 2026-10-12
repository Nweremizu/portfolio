import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from "@/lib/og-card";

export const alt = "Writing | Nweremizu Bruno";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <OgCard
      title="Engineering Thoughts."
      subtitle="Notes on shipping real products: AI-assisted development, architecture calls, and what building things actually teaches."
    />,
    { ...size, fonts: await ogFonts() },
  );
}
