/** "2025-12-02" -> "December 2, 2025". UTC avoids the date shifting a day back in negative-offset timezones. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
