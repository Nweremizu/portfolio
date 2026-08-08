import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogFonts } from "@/lib/og-card";

export const alt = "Projects — Nweremizu Bruno";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <OgCard
      title="Projects."
      subtitle="Practical products, from desktop and mobile apps to full web platforms."
    />,
    { ...size, fonts: await ogFonts() },
  );
}
