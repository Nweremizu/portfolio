"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

/** Live WAT clock. Client-only so server and browser never disagree on the minute. */
export default function LocalTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="tabular-nums">
      {now ? fmt.format(now) : "--:--"} in Nigeria
    </span>
  );
}
