"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full max-w-275 flex flex-col items-center px-3 pt-24 pb-12 text-center">
      <p className="text-accent text-xs sm:text-sm">Error</p>
      <h1 className="text-4xl sm:text-5xl font-medium text-foreground pt-2">
        Something went wrong
      </h1>
      <p className="text-base sm:text-lg text-secondary pt-3 max-w-xl">
        That's on us, not you. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-card px-4 py-2 text-sm font-medium text-secondary transition-colors duration-150 ease hover:text-foreground hover:border-secondary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
