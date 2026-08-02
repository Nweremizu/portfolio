import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full max-w-275 flex flex-col items-center px-3 pt-24 pb-12 text-center">
      <p className="text-accent text-xs sm:text-sm">404</p>
      <h1 className="text-4xl sm:text-5xl font-medium text-foreground pt-2">
        Page not found
      </h1>
      <p className="text-base sm:text-lg text-secondary pt-3 max-w-xl">
        Whatever you were looking for isn't here.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-card px-4 py-2 text-sm font-medium text-secondary transition-colors duration-150 ease hover:text-foreground hover:border-secondary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Back home
      </Link>
    </div>
  );
}
