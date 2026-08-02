"use client";

import { ImageDithering } from "@paper-design/shaders-react";
import { useThemeMode } from "@/components/ui/theme-toggle";

const PALETTE = {
  light: { colorBack: "#f5f4f0", colorFront: "#7e96d3" },
  dark: { colorBack: "#1a1916", colorFront: "#5e74ad" },
};

/** A stylized duotone-dithered cover image, tinted to the current theme. */
export default function DitheredCover({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const theme = useThemeMode();
  const { colorBack, colorFront } = PALETTE[theme];

  return (
    <ImageDithering
      image={src}
      width="100%"
      height="100%"
      className={className}
      role="img"
      aria-label={alt}
      colorBack={colorBack}
      colorFront={colorFront}
      colorSteps={2}
      type="4x4"
      size={3}
      fit="cover"
    />
  );
}
