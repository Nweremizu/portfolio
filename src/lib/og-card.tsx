import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Logo from "@/components/ui/logo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export const OG_BG = "#f5f4f0";
export const OG_FOREGROUND = "#1a1916";
export const OG_SECONDARY = "#707070";

// The logo's own viewBox (364x394), used to size it without distorting it.
const LOGO_ASPECT = 364 / 394;
const LOGO_HEIGHT = 56;

function loadFont(file: string) {
  return readFile(join(process.cwd(), "src/lib/fonts", file));
}

/** satori has no system fonts to fall back on, so the card's monospace has to be loaded as raw bytes per image. */
export async function ogFonts() {
  const [regular, bold] = await Promise.all([
    loadFont("JetBrainsMono-Regular.ttf"),
    loadFont("JetBrainsMono-Bold.ttf"),
  ]);
  return [
    {
      name: "JetBrains Mono",
      data: regular,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "JetBrains Mono",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}

/** Shared branded card for generated OG images: a minimal identity card — logo mark in the corner, title/subtitle stacked bottom-left, all in the site's monospace. */
export function OgCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: OG_BG,
        padding: 72,
        fontFamily: "JetBrains Mono",
      }}
    >
      <Logo style={{ height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT }} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            color: OG_FOREGROUND,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 400,
            color: OG_SECONDARY,
            lineHeight: 1.4,
            marginTop: 16,
            maxWidth: 780,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
