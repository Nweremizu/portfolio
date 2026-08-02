"use client";

/**
 * Scroll area with a macOS-style overlay scrollbar.
 *
 * Architecture note, because it is the whole point: **nothing here simulates
 * scrolling.** The viewport is a real `overflow: auto` element, so momentum,
 * inertia, rubber-banding and trackpad acceleration all come from the OS. Base
 * UI only hides the native scrollbar and paints its own on top, driven by the
 * scroll position. That is why it feels good — a JS scroll-hijacking library
 * (Lenis, Locomotive) replaces those physics with an approximation and breaks
 * native affordances (find-in-page, keyboard paging, `scrollIntoView`).
 *
 * On touch-primary devices Base UI is skipped entirely for a plain overflow
 * container: mobile browsers already draw a good auto-hiding indicator, and
 * their scroll physics beat anything an overlay can add.
 *
 * Adapted from Base UI's ScrollArea; scrollbar treatment follows the reference
 * implementation's mechanics with this project's own tokens.
 */

import { ScrollArea as Primitive } from "@base-ui/react/scroll-area";
import { createContext, useContext } from "react";
import { useTouchPrimary } from "@/hooks/use-touch-primary";
import { cn } from "@/lib/cn";

/** Lets the exported ScrollBar no-op when the parent fell back to native. */
const TouchContext = createContext(false);

type Orientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Classes for the scrolling viewport itself (padding, scroll-padding…). */
  viewportClassName?: string;
  /** Which axes get a scrollbar. Defaults to `"vertical"`. */
  orientation?: Orientation;
}

export function ScrollArea({
  className,
  children,
  viewportClassName,
  orientation = "vertical",
  ...props
}: ScrollAreaProps) {
  const isTouch = useTouchPrimary();

  return (
    <TouchContext.Provider value={isTouch}>
      {isTouch ? (
        <div
          role="group"
          aria-roledescription="scroll area"
          data-slot="scroll-area"
          className={cn("relative overflow-hidden", className)}
          {...props}
        >
          <div
            data-slot="scroll-area-viewport"
            // tabIndex keeps the region keyboard-scrollable, which a plain
            // overflow div is not.
            tabIndex={0}
            className={cn(
              "size-full rounded-[inherit]",
              orientation === "vertical" && "overflow-y-auto",
              orientation === "horizontal" && "overflow-x-auto",
              orientation === "both" && "overflow-auto",
              viewportClassName,
            )}
          >
            {children}
          </div>
        </div>
      ) : (
        <Primitive.Root
          data-slot="scroll-area"
          className={cn("relative overflow-hidden", className)}
          {...props}
        >
          <Primitive.Viewport
            data-slot="scroll-area-viewport"
            className={cn("size-full rounded-[inherit]", viewportClassName)}
          >
            {/* Content gives Base UI an intrinsic box to measure overflow
                against — without it horizontal overflow never registers. */}
            <Primitive.Content>{children}</Primitive.Content>
          </Primitive.Viewport>
          {orientation !== "horizontal" && <ScrollBar orientation="vertical" />}
          {orientation !== "vertical" && <ScrollBar orientation="horizontal" />}
          {orientation === "both" && <Primitive.Corner />}
        </Primitive.Root>
      )}
    </TouchContext.Provider>
  );
}

export function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentPropsWithoutRef<typeof Primitive.Scrollbar>) {
  if (useContext(TouchContext)) return null;

  return (
    <Primitive.Scrollbar
      orientation={orientation}
      data-slot="scroll-area-scrollbar"
      className={cn(
        // A 10px track is the hit target; the thumb inside rests much thinner,
        // so the control stays out of the way until you reach for it.
        "group/scrollbar absolute z-20 flex touch-none select-none",
        // Base UI keeps the scrollbar mounted whenever the area is scrollable
        // and exposes state as attributes, so visibility is a pure CSS opacity
        // transition — no presence animation, no React state, no re-renders on
        // scroll.
        //
        // Appears instantly (delay-0) but leaves on a delay: the wait is longer
        // than the thumb's own width transition, so on hide the thumb visibly
        // narrows first and *then* fades, instead of the fade masking it.
        "opacity-0 transition-opacity duration-[120ms] ease-out delay-[160ms]",
        "data-[hovering]:opacity-100 data-[scrolling]:opacity-100",
        "data-[hovering]:duration-[160ms] data-[scrolling]:duration-[160ms]",
        "data-[hovering]:delay-0 data-[scrolling]:delay-0",
        orientation === "vertical" && "top-0 right-0 h-full w-2.5",
        orientation === "horizontal" && "bottom-0 left-0 h-2.5 w-full flex-col",
        className,
      )}
      {...props}
    >
      <Primitive.Thumb
        data-slot="scroll-area-thumb"
        className={cn(
          // Tinted from --foreground, so it inverts with the theme for free
          // rather than needing a second dark-mode colour.
          "relative rounded-full bg-foreground/25",
          "transition-[background-color,width,height] duration-[160ms] ease-out",
          "group-hover/scrollbar:bg-foreground/40 active:!bg-foreground/55",
          // Size comes from Base UI: viewport/content ratio, same as a native
          // scrollbar. The -translate nudges the thumb off the very edge while
          // the track stays flush, so edge-throws still land on the target.
          orientation === "vertical" &&
            "mx-auto my-1 w-1.5 -translate-x-px h-[var(--scroll-area-thumb-height)] group-hover/scrollbar:w-2",
          orientation === "horizontal" &&
            "my-auto mx-1 h-1.5 -translate-y-px w-[var(--scroll-area-thumb-width)] group-hover/scrollbar:h-2",
        )}
      />
    </Primitive.Scrollbar>
  );
}
