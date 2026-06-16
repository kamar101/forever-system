import type { CalendarCell } from "@/domain/calendar";

/**
 * The contribution calendar: a GitHub-style grid of the user's Days. Completed
 * Days render green, every other Day renders empty (the calm "no contribution"
 * cell). Green is uniform regardless of Gear — the grid is fed only each Day's
 * binary state, so there is nothing to graduate. See CONTEXT.md / ADR-0004.
 */
export function ContributionCalendar({ weeks }: { weeks: CalendarCell[][] }) {
  return (
    <section className="calendar" aria-label="Contribution calendar">
      <h2>Contribution calendar</h2>
      <div className="calendar-grid">
        {weeks.map((week, w) => (
          <div className="calendar-week" key={w}>
            {week.map((cell) => (
              <div
                key={cell.date}
                className={`calendar-cell ${cell.state}`}
                data-state={cell.state}
                title={cell.date}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
