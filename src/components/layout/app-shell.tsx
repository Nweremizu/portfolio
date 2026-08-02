"use client";

import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/cn";

/**
 * Chooses the scroller for a route.
 *
 * Most routes scroll the document. That is not laziness — the home page's
 * bento deck is `position: sticky` and PaintedText drives its word paint from
 * Motion's `useScroll`, which measures the window. Moving the scroller into a
 * wrapper silently breaks both, so those routes must stay document-scrolled.
 *
 * Routes listed below instead scroll inside a ScrollArea, which gets them the
 * overlay scrollbar. The whole shell — header, page, footer — goes inside that
 * container: if only the page content were wrapped, the container's fixed
 * height would sit *in addition to* the chrome, the document would overflow
 * too, and you would end up with two scrollbars.
 *
 * Only add a route here once you have checked it has no scroll-driven
 * animation reading the window.
 */
const CONTAINED_SCROLL_ROUTES = new Set(["/projects"]);

const SHELL =
  "flex flex-col items-center py-4 px-8 sm:px-12 bg-background font-sans";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (!CONTAINED_SCROLL_ROUTES.has(pathname)) {
    return <main className={cn(SHELL, "min-h-screen")}>{children}</main>;
  }

  return (
    // 100dvh, not 100vh: on mobile browsers vh ignores the collapsing URL bar,
    // which would leave the container taller than the visible viewport and
    // push the scrollbar's lower end off-screen.
    <ScrollArea className="h-[100dvh] w-full bg-background">
      <main className={cn(SHELL, "min-h-[100dvh]")}>{children}</main>
    </ScrollArea>
  );
}
