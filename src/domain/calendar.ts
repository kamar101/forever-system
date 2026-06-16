// The contribution calendar: a GitHub-style grid of the user's Days. The surface
// is binary — a completed (green) Day renders green, every other Day (Pulsed but
// incomplete, or never Pulsed) renders empty. Green is uniform regardless of the
// Day's Gear: this builder only ever sees a Day's `status`, never its Gear or
// Capacity, so a Gear-1 green and a Gear-4 green are identical by construction.
// There is no red or yellow state. See CONTEXT.md and ADR-0004.

export type CalendarCellState = "green" | "empty";

/** One day in the grid. `date` is an ISO `YYYY-MM-DD` string (UTC). */
export type CalendarCell = {
  date: string;
  state: CalendarCellState;
};

/** The minimal shape the calendar needs from a Day. */
type DayForCalendar = {
  date: Date;
  status: "green" | "empty";
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Format a Date as a UTC `YYYY-MM-DD` key. */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Build the contribution calendar as columns of weeks (oldest first), each a
 * 7-cell column running Sunday→Saturday. The grid ends with the week containing
 * `today` and spans `weeks` columns back from there (default 53, a rolling year).
 *
 * Each calendar date is looked up against the user's Days: a Day with status
 * `green` yields a green cell, any other status yields empty, and a date with no
 * Day at all is likewise empty — so Pulsed-but-incomplete and never-Pulsed Days
 * are indistinguishable, exactly as the product requires.
 */
export function buildContributionCalendar(
  days: readonly DayForCalendar[],
  { today, weeks = 53 }: { today: Date; weeks?: number },
): CalendarCell[][] {
  const greenDates = new Set(
    days.filter((d) => d.status === "green").map((d) => isoDate(d.date)),
  );

  // The Saturday that ends today's week (grid's last cell), in UTC.
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const endOfWeek = todayUtc + (6 - new Date(todayUtc).getUTCDay()) * MS_PER_DAY;
  // The Sunday that starts the first (oldest) week.
  const start = endOfWeek - (weeks * 7 - 1) * MS_PER_DAY;

  const grid: CalendarCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = isoDate(new Date(start + (w * 7 + d) * MS_PER_DAY));
      column.push({ date, state: greenDates.has(date) ? "green" : "empty" });
    }
    grid.push(column);
  }
  return grid;
}
