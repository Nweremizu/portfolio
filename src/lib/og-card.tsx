import Logo from "@/components/ui/logo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#f5f4f0";
const FOREGROUND = "#1a1916";
// primary-dark, not primary: --primary (#7e96d3) is legible on the dark
// theme's background but too washed out on this light one.
const PRIMARY = "#38477a";
const SECONDARY = "#707070";

// The logo's own viewBox (364x394), used to size it without distorting it.
const LOGO_ASPECT = 364 / 394;
const LOGO_HEIGHT = 820;

/** Shared branded card for generated OG images: dark surface, kicker/title/subtitle, logo mark bleeding off the edge — same oversized, cropped treatment as the About Me bento card. */
export function OgCard({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: BG,
        padding: 80,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "62%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 600,
            color: PRIMARY,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: FOREGROUND,
            lineHeight: 1.1,
            marginTop: 20,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: SECONDARY,
            lineHeight: 1.4,
            marginTop: 28,
          }}
        >
          {subtitle}
        </div>
      </div>

      <Logo
        style={{
          position: "absolute",
          top: -90,
          right: -120,
          height: LOGO_HEIGHT,
          width: LOGO_HEIGHT * LOGO_ASPECT,
        }}
      />
    </div>
  );
}
