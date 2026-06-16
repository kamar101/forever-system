import { describe, expect, it } from "vitest";
import { buildContributionCalendar } from "./calendar";

// A fixed reference "today" so the grid is deterministic. 2026-06-16 is a Tuesday.
const TODAY = new Date("2026-06-16T00:00:00.000Z");

/** Flatten the week-columns into one list of cells for easy assertions. */
function allCells(weeks: { date: string; state: string }[][]) {
  return weeks.flat();
}

function cellOn(weeks: { date: string; state: string }[][], date: string) {
  return allCells(weeks).find((c) => c.date === date);
}

describe("buildContributionCalendar", () => {
  it("renders a completed Day as a green cell", () => {
    const weeks = buildContributionCalendar(
      [{ date: new Date("2026-06-16T00:00:00.000Z"), status: "green" }],
      { today: TODAY },
    );

    expect(cellOn(weeks, "2026-06-16")?.state).toBe("green");
  });

  it("renders an incomplete (empty) Day as an empty cell", () => {
    const weeks = buildContributionCalendar(
      [{ date: new Date("2026-06-16T00:00:00.000Z"), status: "empty" }],
      { today: TODAY },
    );

    expect(cellOn(weeks, "2026-06-16")?.state).toBe("empty");
  });

  it("renders a never-Pulsed date (no Day) as empty, indistinguishable from an incomplete Day", () => {
    const weeks = buildContributionCalendar(
      // 06-15 was Pulsed but left incomplete; 06-14 was never Pulsed at all.
      [{ date: new Date("2026-06-15T00:00:00.000Z"), status: "empty" }],
      { today: TODAY },
    );

    const pulsedIncomplete = cellOn(weeks, "2026-06-15");
    const neverPulsed = cellOn(weeks, "2026-06-14");
    expect(neverPulsed?.state).toBe("empty");
    expect(pulsedIncomplete?.state).toBe("empty");
    expect(neverPulsed?.state).toBe(pulsedIncomplete?.state);
  });

  it("renders green uniformly — completion alone drives it, never the Gear", () => {
    // Two green Days that (in the real model) settled at different Gears. The
    // builder is given only `status`, so they cannot render differently: there
    // is no Gear input and no graduated-green state to leak.
    const weeks = buildContributionCalendar(
      [
        { date: new Date("2026-06-15T00:00:00.000Z"), status: "green" },
        { date: new Date("2026-06-16T00:00:00.000Z"), status: "green" },
      ],
      { today: TODAY },
    );

    const states = new Set(allCells(weeks).map((c) => c.state));
    expect(states).toEqual(new Set(["green", "empty"]));
    expect(cellOn(weeks, "2026-06-15")?.state).toBe(
      cellOn(weeks, "2026-06-16")?.state,
    );
  });

  it("lays out 53 Sunday-aligned week columns ending with today's week", () => {
    const weeks = buildContributionCalendar([], { today: TODAY });

    // A rolling year: 53 columns, each a full Sun→Sat week.
    expect(weeks).toHaveLength(53);
    expect(weeks.every((col) => col.length === 7)).toBe(true);

    // Every column starts on a Sunday (UTC day 0) and ends on a Saturday (6).
    const dow = (date: string) => new Date(`${date}T00:00:00.000Z`).getUTCDay();
    expect(weeks.every((col) => dow(col[0].date) === 0)).toBe(true);
    expect(weeks.every((col) => dow(col[6].date) === 6)).toBe(true);

    // The last column is the week containing today (Tue 2026-06-16).
    const lastWeek = weeks[weeks.length - 1];
    expect(lastWeek[0].date).toBe("2026-06-14"); // Sunday
    expect(lastWeek[2].date).toBe("2026-06-16"); // today
    expect(lastWeek[6].date).toBe("2026-06-20"); // Saturday
  });

  it("honours a custom week count", () => {
    const weeks = buildContributionCalendar([], { today: TODAY, weeks: 12 });
    expect(weeks).toHaveLength(12);
  });
});
