import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgCard } from "@/lib/og-card";

export const alt = "Nweremizu Bruno — Full-Stack Developer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return new ImageResponse(
    <OgCard
      kicker="Portfolio"
      title="Nweremizu Bruno"
      subtitle="Full-stack developer building practical products."
    />,
    { ...size },
  );
}
