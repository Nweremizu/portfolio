import Link from "next/link";
import CircuitBoard from "@/components/circuit-board";
import LocalTime from "@/components/layout/local-time";
import { socials } from "@/lib/socials";

const links = [
  { label: "Email", href: socials.Gmail },
  { label: "GitHub", href: socials.GitHub },
  { label: "LinkedIn", href: socials.LinkedIn },
  { label: "X", href: socials.X },
];

export default function SiteFooter() {
  return (
    <footer className="mt-28 sm:mt-36">
      <section aria-labelledby="bench-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="bench-heading" className="font-mono text-xs text-secondary">
            On the bench
          </h2>
          <Link
            href="/projects/network-manager"
            data-sound="navigation.forward"
            className="text-sm text-secondary transition-colors duration-150 hover:text-foreground"
          >
            Network Manager →
          </Link>
        </div>
        <p className="mb-6 max-w-[34rem] text-pretty text-secondary">
          Away from software I build hardware: microcontrollers, circuits, and
          the firmware that runs them. This board is a toy one. Press{" "}
          <span className="font-mono text-[0.85em] text-foreground">SW1</span>.
        </p>
        <CircuitBoard />
      </section>

      <div className="mt-16 flex flex-col gap-4 border-t border-border py-8 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                {...(/^https?:/.test(href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : null)}
                className="transition-colors duration-150 hover:text-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="flex gap-4 font-mono text-xs">
          <LocalTime />
          <span>© {new Date().getFullYear()}</span>
        </p>
      </div>
    </footer>
  );
}
