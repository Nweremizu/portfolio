import Link from "next/link";
import { SoundToggle } from "@/components/sound/sounds";
import Logo from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { intro } from "@/lib/content";

export default function SiteHeader() {
  return (
    <header className="rise flex items-center justify-between gap-4 pt-8 pb-16 sm:pt-12 sm:pb-20">
      <Link href="/" className="flex min-w-0 items-center gap-3">
        {/* Avatar mark: the illustrated logo cropped into a circle. */}
        <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-primary">
          <Logo className="absolute bottom-0 left-1/2 h-10 w-auto -translate-x-1/2 translate-y-2.5" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-medium text-foreground">
            Nweremizu Bruno
          </span>
          <span className="truncate text-sm text-secondary">{intro.role}</span>
        </span>
      </Link>

      {/* One bordered capsule so the controls read as controls, not text. */}
      <nav className="flex shrink-0 items-center gap-0.5 rounded-full p-1 shadow-[inset_0_0_0_1px_var(--border)]">
        <Link
          href="/writing"
          className="flex h-8 items-center rounded-full px-3 text-sm text-secondary transition-[background-color,color] duration-150 hover:bg-card hover:text-foreground"
        >
          Writing
        </Link>
        <ThemeToggle />
        <SoundToggle />
      </nav>
    </header>
  );
}
