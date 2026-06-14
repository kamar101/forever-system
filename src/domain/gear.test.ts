import { describe, expect, it } from "vitest";
import { GEARS, groupTasksByGear, isGear, type Gear } from "./gear";

// Table-driven domain tests (see capacity.test.ts for the convention).

describe("isGear", () => {
  const cases: { name: string; value: number; expected: boolean }[] = [
    { name: "1 is the worst-day safety net", value: 1, expected: true },
    { name: "4 is the best day", value: 4, expected: true },
    { name: "0 is below range", value: 0, expected: false },
    { name: "5 is above range", value: 5, expected: false },
    { name: "2.5 is not a whole Gear", value: 2.5, expected: false },
  ];

  it.each(cases)("$name", ({ value, expected }) => {
    expect(isGear(value)).toBe(expected);
  });
});

describe("groupTasksByGear", () => {
  it("returns one bucket per Gear in display order 4 → 1", () => {
    expect(groupTasksByGear([]).map((g) => g.gear)).toEqual([...GEARS]);
  });

  it("places each Task in its Gear's bucket, preserving input order", () => {
    const tasks: { id: string; gear: Gear }[] = [
      { id: "a", gear: 4 },
      { id: "b", gear: 1 },
      { id: "c", gear: 4 },
      { id: "d", gear: 2 },
    ];

    const byGear = Object.fromEntries(
      groupTasksByGear(tasks).map((g) => [g.gear, g.tasks.map((t) => t.id)]),
    );

    expect(byGear[4]).toEqual(["a", "c"]);
    expect(byGear[3]).toEqual([]);
    expect(byGear[2]).toEqual(["d"]);
    expect(byGear[1]).toEqual(["b"]);
  });
});
