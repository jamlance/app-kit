// Formatting helpers: money in the merchant's currency, dates in the merchant's time zone, relative times.
// Intl needs an explicit timeZone or server and browser render different days (hydration mismatch).

export const DEFAULT_TIME_ZONE = "America/Jamaica";

/** "J$5,000.00" style. `cents: false` drops the decimals for whole amounts in tiles and lists. */
export function formatMoney(amount: number, currency: string, opts: { cents?: boolean } = {}): string {
  const cents = opts.cents ?? true;
  try {
    return new Intl.NumberFormat("en-JM", {
      style: "currency",
      currency,
      minimumFractionDigits: cents ? 2 : 0,
      maximumFractionDigits: cents ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(cents ? 2 : 0)}`;
  }
}

function toDate(v: string | number | Date): Date {
  return v instanceof Date ? v : new Date(typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T12:00:00Z` : v);
}

/** "Oct 14, 2025" (year dropped when it's this year unless `year: true`). */
export function formatDate(v: string | number | Date, opts: { year?: boolean; timeZone?: string } = {}): string {
  const d = toDate(v);
  const tz = opts.timeZone ?? DEFAULT_TIME_ZONE;
  const thisYear = new Date().getFullYear() === Number(new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: tz }).format(d));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(opts.year || !thisYear ? { year: "numeric" } : {}),
    timeZone: tz,
  }).format(d);
}

/** "5:57 pm" */
export function formatTime(v: string | number | Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone })
    .format(toDate(v))
    .replace("AM", "am")
    .replace("PM", "pm");
}

/** "4 min ago", "3 h ago", "yesterday", then a date. */
export function relativeTime(v: string | number | Date, now: Date = new Date()): string {
  const s = Math.round((now.getTime() - toDate(v).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return "yesterday";
  return formatDate(v);
}

/** Whole days from today to `v` (negative when past). */
export function daysUntil(v: string | Date, now: Date = new Date()): number {
  const a = toDate(v);
  return Math.round((a.getTime() - now.getTime()) / 86400000);
}
