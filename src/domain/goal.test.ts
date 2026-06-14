import { describe, expect, it } from "vitest";
import { canActivateGoal } from "./goal";

describe("canActivateGoal", () => {
  const cases: {
    name: string;
    tasks: { gear: number }[];
    expected: boolean;
  }[] = [
    {
      name: "no tasks → false (no Gear-1 safety net)",
      tasks: [],
      expected: false,
    },
    {
      name: "only Gear-4 tasks → false",
      tasks: [{ gear: 4 }, { gear: 4 }],
      expected: false,
    },
    {
      name: "Gear 2 and 3 but no Gear 1 → false",
      tasks: [{ gear: 2 }, { gear: 3 }],
      expected: false,
    },
    {
      name: "exactly one Gear-1 task → true",
      tasks: [{ gear: 1 }],
      expected: true,
    },
    {
      name: "Gear-1 task among higher-gear tasks → true",
      tasks: [{ gear: 4 }, { gear: 1 }, { gear: 3 }],
      expected: true,
    },
  ];

  it.each(cases)("$name", ({ tasks, expected }) => {
    expect(canActivateGoal({ tasks })).toBe(expected);
  });
});
