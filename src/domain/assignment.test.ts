import { describe, expect, it } from "vitest";
import { composeAssignment, type AssignmentItem } from "./assignment";
import type { Capacity } from "./capacity";

const GOAL_ID = "goal-1";

// A goal with one task at each Gear, so we can verify exact-Gear selection.
const mixedGoal = {
  id: GOAL_ID,
  tasks: [
    { description: "Gear-4 task", gear: 4 },
    { description: "Gear-3 task", gear: 3 },
    { description: "Gear-2 task", gear: 2 },
    { description: "Gear-1 task", gear: 1 },
  ],
};

describe("composeAssignment — single-Goal case", () => {
  const cases: {
    name: string;
    capacity: Capacity;
    expectedGear: number;
    expectedDescription: string;
  }[] = [
    {
      name: "Good capacity → Gear-4 task included",
      capacity: "Good",
      expectedGear: 4,
      expectedDescription: "Gear-4 task",
    },
    {
      name: "Average capacity → Gear-3 task included",
      capacity: "Average",
      expectedGear: 3,
      expectedDescription: "Gear-3 task",
    },
    {
      name: "Bad capacity → Gear-2 task included",
      capacity: "Bad",
      expectedGear: 2,
      expectedDescription: "Gear-2 task",
    },
    {
      name: "Worst capacity → Gear-1 task included",
      capacity: "Worst",
      expectedGear: 1,
      expectedDescription: "Gear-1 task",
    },
  ];

  it.each(cases)(
    "$name",
    ({ capacity, expectedGear, expectedDescription }) => {
      const items = composeAssignment(capacity, [mixedGoal]);
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject<AssignmentItem>({
        goalId: GOAL_ID,
        taskDescription: expectedDescription,
        gear: expectedGear as AssignmentItem["gear"],
        completed: false,
      });
    },
  );

  it("includes all tasks at the selected Gear (not just the first)", () => {
    const goal = {
      id: GOAL_ID,
      tasks: [
        { description: "Run 20 min", gear: 4 },
        { description: "Read 30 pages", gear: 4 },
        { description: "Low-gear task", gear: 1 },
      ],
    };
    const items = composeAssignment("Good", [goal]);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.taskDescription)).toEqual([
      "Run 20 min",
      "Read 30 pages",
    ]);
  });

  it("returns empty when the goal has no tasks at the selected Gear", () => {
    const goal = {
      id: GOAL_ID,
      tasks: [{ description: "Safety net", gear: 1 }],
    };
    const items = composeAssignment("Good", [goal]); // Good → Gear 4, but only Gear-1 task
    expect(items).toHaveLength(0);
  });

  it("returns empty when there are no active goals", () => {
    const items = composeAssignment("Good", []);
    expect(items).toHaveLength(0);
  });
});
