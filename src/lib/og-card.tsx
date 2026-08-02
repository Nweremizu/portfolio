export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#1a1916";
const PRIMARY = "#7e96d3";
const PRIMARY_DIM = "#3d4665";
const SECONDARY = "#adadad";

/** Deterministic dithered-dot texture, echoing the /writing cover art. Same input -> same pattern, so builds stay reproducible. */
function DotGrid({ cols = 9, rows = 7 }: { cols?: number; rows?: number }) {
  const dots: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = (col * 7 + row * 13) % 5;
      const color = n === 0 ? PRIMARY : n === 1 ? PRIMARY_DIM : "transparent";
      dots.push(
        <div
          key={`${col}-${row}`}
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: color,
          }}
        />,
      );
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: cols * 24,
        gap: 16,
      }}
    >
      {dots}
    </div>
  );
}

/** Shared branded card for generated OG images: dark surface, kicker/title/subtitle, dot-grid accent. */
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
        background: BG,
        padding: 80,
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
            color: "#ffffff",
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          width: "38%",
        }}
      >
        <DotGrid />
      </div>
    </div>
  );
}
