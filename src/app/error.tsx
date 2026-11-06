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
    <div className="rise">
      <p className="font-mono text-xs text-secondary">Error</p>
      <h1 className="mt-2 text-2xl text-foreground">Something went wrong</h1>
      <p className="mt-3 text-secondary">That's on me, not you. Try again in a moment.</p>
      <button type="button" onClick={reset} className="link mt-6 cursor-pointer text-foreground">Try again</button>
    </div>
  );
}
