import Logo from "@/components/ui/logo";
import { footerStatement as STATEMENT } from "@/lib/content";
import { socials } from "@/lib/socials";

/**
 * A hairline rule with controllable dash geometry. `border-dashed` gives no say
 * over dash length or gap, and its default dashes are too short and tight to
 * read as the deliberate, widely-spaced rule this design wants.
 */
function DashedRule() {
  return (
    <div
      aria-hidden
      className="h-px w-full text-secondary"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, currentColor 0 7px, transparent 7px 15px)",
        opacity: 0.45,
      }}
    />
  );
}

const linkClass =
  "text-secondary font-medium transition-colors duration-150 ease " +
  "hover:text-foreground hover:underline hover:decoration-2 decoration-dotted " +
  "underline-offset-4 rounded-sm focus-visible:outline-2 " +
  "focus-visible:outline-offset-4 focus-visible:outline-primary";

export default function Footer() {
  return (
    <footer className="w-full max-w-275 mt-24 sm:mt-32">
      <DashedRule />

      <h2 className="pt-10 sm:pt-14 text-4xl sm:text-5xl font-medium text-balance text-foreground">
        {STATEMENT[0]}{" "}
        {/* Emphasis is carried by colour, not italics: Outfit ships no italic
            face, so `italic` here would render as a browser-synthesised
            oblique.

            The pair has to swap by theme. Neither --primary nor --primary-dark
            is redefined in .dark, so each is only legible against one of the
            two backgrounds: --primary-dark is 8.2:1 on the light background
            but 2.0:1 on the dark one, and --primary is the reverse. Swapping
            keeps the accent above 6:1 either way. */}
        <span className="text-primary-dark dark:text-primary">
          {STATEMENT[1]}
        </span>
      </h2>

      <ul className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-10 sm:pt-14">
        {Object.entries(socials).map(([label, href]) => {
          const external = /^https?:/i.test(href);
          return (
            <li key={label}>
              <a
                href={href}
                className={linkClass}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : null)}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 sm:mt-14">
        <DashedRule />
        <div className="flex items-center justify-between gap-4 py-6">
          <p className="text-sm text-secondary">
            {/* Rendered on the server and hydrated on the client; both agree
                except across a New Year boundary mid-session. */}
            © {new Date().getFullYear()} Nweremizu Bruno
          </p>
          {/* Same treatment as the nav mark, scaled down. */}
          <div className="size-8 bg-primary rounded-full relative flex items-center justify-center overflow-hidden shrink-0">
            <Logo className="h-8 w-auto absolute bottom-0 translate-y-2" />
          </div>
        </div>
      </div>
    </footer>
  );
}
