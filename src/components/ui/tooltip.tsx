// components/base/tooltip/tooltip.tsx
"use client";

import {
  OverlayArrow as AriaOverlayArrow,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
} from "react-aria-components";
import { cn, sortCx } from "@/lib/cn";

// Light-surface tooltip, styled to match the card / dropdown family:
//   surface  bg background/primary/default (white), 1px border/button/default,
//            radius/lg, shadow/dropdown, text/primary.
//   sizes    sm → px 10 py 6, Caption 1/Medium (12px)
//            md → px 12 py 8, Body 1/Medium   (14px)
//   arrow    filled caret that rotates to face the trigger via the
//            OverlayArrow's data-placement.
//
// Behaviour comes from react-aria's TooltipTrigger / Tooltip: hover + focus
// open, Escape closes, collision flipping and the aria-describedby wiring.
// BoardUI opens and begins closing immediately. Its non-interactive surface
// cannot keep itself open after the pointer leaves the trigger.
// The open/close animation blurs + scales from 0.9, in and out.

const sizes = sortCx({
  sm: "px-2.5 py-1.5 text-caption-1-medium",
  md: "px-3 py-2 text-body-medium",
});

interface TooltipProps extends React.ComponentProps<typeof AriaTooltip> {
  size?: keyof typeof sizes;
  showArrow?: boolean;
  offset?: number;
  children: React.ReactNode;
}

export function Tooltip({
  children,
  className,
  size = "sm",
  showArrow = true,
  offset = 10,
  ...props
}: Readonly<TooltipProps>) {
  return (
    <AriaTooltip
      offset={offset}
      {...props}
      className={(state) =>
        cn(
          "pointer-events-none z-50 max-w-60 select-none rounded-lg border border-neutral-100 bg-background text-text-primary shadow-dropdown",
          sizes[size],
          "transition duration-200 ease-out",
          "data-entering:scale-90 data-entering:opacity-0 data-entering:blur-xs",
          "data-exiting:scale-90 data-exiting:opacity-0 data-exiting:blur-xs",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {showArrow && (
        <AriaOverlayArrow className="group">
          <svg
            width={12}
            height={6}
            viewBox="0 0 12 6"
            className={cn(
              "block fill-background",
              "group-data-[placement=bottom]:rotate-180",
              "group-data-[placement=left]:-rotate-90",
              "group-data-[placement=right]:rotate-90",
            )}
          >
            <path d="M0 0 L6 6 L12 0 Z" />
          </svg>
        </AriaOverlayArrow>
      )}
      {children}
    </AriaTooltip>
  );
}

export function TooltipTrigger({ delay = 0, closeDelay = 0, ...props }: any) {
  return (
    <AriaTooltipTrigger delay={delay} closeDelay={closeDelay} {...props} />
  );
}
