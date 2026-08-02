"use client";

import {
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Dialog,
  type ModalOverlayProps,
} from "react-aria-components";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";

/**
 * The app's modal surface.
 *
 * react-aria-components owns the hard parts — focus trap, Escape, scroll lock,
 * `aria-modal`, restoring focus to the trigger — and exposes `[data-entering]`
 * / `[data-exiting]`, keeping the element mounted until the exit transition
 * finishes. That lets the whole animation be CSS, which runs off the main
 * thread and stays smooth even while the page is busy.
 *
 * Motion notes:
 * - Enter 280ms, exit 200ms. Exit is faster because the user has already
 *   decided; only the entrance needs to be savoured.
 * - Scale starts at 0.96, never 0 — nothing in the real world appears from
 *   nothing, and a barely-inset start reads as arriving rather than inflating.
 * - `transform-origin: center` is deliberate. Popovers should scale from their
 *   trigger, but a modal isn't anchored to one — it belongs to the viewport.
 * - Enter and exit run the same path in reverse, so dismissing feels like the
 *   opening played backwards rather than a different animation.
 */

// Written out literally, never interpolated: Tailwind only emits utilities it
// can find as complete strings, so `ease-[${VAR}]` compiles to nothing at all.
const EASE_OUT = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export function Modal({
  className,
  children,
  ...props
}: ModalOverlayProps & { children: React.ReactNode }) {
  return (
    <AriaModalOverlay
      {...props}
      isDismissable
      className={cn(
        "fixed inset-0 z-50 flex min-h-full items-center justify-center p-4 sm:p-6",
        // Dim to focus, and blur so the page behind reads as pushed back
        // rather than merely darkened.
        "bg-black/25 backdrop-blur-[2px]",
        "transition-opacity duration-[280ms] data-[exiting]:duration-200",
        EASE_OUT,
        "data-[entering]:opacity-0 data-[exiting]:opacity-0",
        // Reduced motion: the scrim still fades (it aids comprehension), the
        // panel below simply stops moving.
        "motion-reduce:transition-none",
      )}
    >
      <AriaModal
        className={cn(
          // No overflow here: the ScrollArea below owns scrolling, so the panel
          // stays a plain sized box. Leaving `overflow-y-auto` on as well would
          // create a second, redundant scroller wrapping the first.
          "w-full max-w-4xl max-h-[90vh] flex",
          "bg-card rounded-2xl shadow-2xl shadow-black/10 origin-center",
          // Must name `scale` and `translate`, not `transform`. Tailwind v4's
          // scale-*/translate-* utilities set the standalone CSS properties, so
          // a `transition-[...transform]` list silently covers neither and the
          // panel snaps to size instead of easing into it.
          "transition-[opacity,scale,translate] duration-[280ms] data-[exiting]:duration-200",
          EASE_OUT,
          "data-[entering]:opacity-0 data-[entering]:scale-[0.96] data-[entering]:translate-y-2",
          "data-[exiting]:opacity-0 data-[exiting]:scale-[0.96] data-[exiting]:translate-y-2",
          "motion-reduce:transition-opacity motion-reduce:data-[entering]:scale-100",
          "motion-reduce:data-[entering]:translate-y-0 motion-reduce:data-[exiting]:scale-100",
          "motion-reduce:data-[exiting]:translate-y-0",
          className,
        )}
      >
        {/* rounded-[inherit] so the overlay scrollbar is clipped to the panel's
            corner radius instead of overhanging it. */}
        <ScrollArea className="w-full rounded-[inherit]">
          <Dialog className="outline-none">{children}</Dialog>
        </ScrollArea>
      </AriaModal>
    </AriaModalOverlay>
  );
}
