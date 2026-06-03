/**
 * Compact relative-time formatter (e.g. "just now", "3h ago", "2d ago").
 * Falls back to a localized date for anything older than a week. No date lib.
 */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Mar 2023" style month-year label; empty string for null/invalid input. */
export function formatMonthYear(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

/** "Mar 2023 – Present" style range for experience/education entries. */
export function formatDateRange(start: string, end: string | null): string {
  const from = formatMonthYear(start);
  const to = end ? formatMonthYear(end) : "Present";
  return from ? `${from} – ${to}` : to;
}
