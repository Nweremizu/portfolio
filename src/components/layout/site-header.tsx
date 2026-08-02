import Link from "next/link";
import GithubIcon from "@/components/icons/github";
import GmailIcon from "@/components/icons/gmail";
import LinkedinIcon from "@/components/icons/linkedin";
import XIcon from "@/components/icons/x";
import Logo from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { socials } from "@/lib/socials";

// Icon-only links, so each needs an explicit accessible name — an <svg> with
// no text leaves a screen reader announcing nothing but "link".
const navSocials = [
  { label: "Email", href: socials.Gmail, Icon: GmailIcon },
  { label: "GitHub", href: socials.GitHub, Icon: GithubIcon },
  { label: "LinkedIn", href: socials.LinkedIn, Icon: LinkedinIcon },
  { label: "X", href: socials.X, Icon: XIcon },
];

const navLinkClass =
  "text-secondary transition-colors duration-150 ease font-medium " +
  "hover:text-foreground wrap-break-word hover:underline hover:decoration-2 decoration-dotted " +
  "underline-offset-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export default function SiteHeader() {
  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] w-full items-center">
      <div className="flex items-center justify-center gap-8 justify-self-start">
        {/* These were <div>s — styled to look like links but not focusable,
            not announced as links, and not navigable. */}
        <Link href="/projects" className={navLinkClass}>
          Projects
        </Link>
        <Link href="/writing" className={navLinkClass}>
          Writing
        </Link>
      </div>

      <div className="size-12 bg-primary rounded-full relative flex items-center justify-center overflow-hidden justify-self-center">
        <Logo className="h-12 w-auto absolute bottom-0 translate-y-3" />
      </div>

      <div className="flex items-center justify-center gap-4.5 justify-self-end">
        {navSocials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            // mailto: stays in place — opening a mail client in a new tab
            // leaves a dead blank tab behind.
            {...(/^https?:/i.test(href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : null)}
            className="hidden md:block text-secondary transition-colors duration-150 ease hover:text-foreground rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Icon className="h-6 w-auto" />
          </a>
        ))}
        <div className="h-6 w-px bg-secondary hidden md:block" />
        <ThemeToggle />
      </div>
    </nav>
  );
}
