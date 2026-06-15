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

  it("degrades to lower Gear when goal has no task at the selected Gear", () => {
    const goal = {
      id: GOAL_ID,
      tasks: [{ description: "Safety net", gear: 1 }],
    };
    // Good → Gear 4; no Gear-4 task, so degrades all the way down to Gear 1
    const items = composeAssignment("Good", [goal]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ taskDescription: "Safety net", gear: 1 });
  });

  it("returns empty when there are no active goals", () => {
    const items = composeAssignment("Good", []);
    expect(items).toHaveLength(0);
  });
});

describe("composeAssignment — multi-Goal breadth", () => {
  it("Worst day with 2 goals spans only the top-ranked Goal", () => {
    const goal1 = {
      id: "goal-1",
      tasks: [{ description: "Goal-1 safety net", gear: 1 }],
    };
    const goal2 = {
      id: "goal-2",
      tasks: [{ description: "Goal-2 safety net", gear: 1 }],
    };
    const items = composeAssignment("Worst", [goal1, goal2]);
    expect(items.map((i) => i.goalId)).toEqual(["goal-1"]);
  });

  // Build N goals each with one task at every Gear so breadth tests
  // can pick any Capacity without hitting a "no task" miss.
  function makeGoals(n: number) {
    return Array.from({ length: n }, (_, i) => ({
      id: `goal-${i + 1}`,
      tasks: [
        { description: `G${i + 1} gear-4`, gear: 4 },
        { description: `G${i + 1} gear-3`, gear: 3 },
        { description: `G${i + 1} gear-2`, gear: 2 },
        { description: `G${i + 1} gear-1`, gear: 1 },
      ],
    }));
  }

  const breadthCases: {
    name: string;
    numGoals: number;
    capacity: Capacity;
    expectedBreadth: number;
  }[] = [
    // N = 4
    { name: "4 goals, Good → all 4", numGoals: 4, capacity: "Good", expectedBreadth: 4 },
    { name: "4 goals, Average → 3", numGoals: 4, capacity: "Average", expectedBreadth: 3 },
    { name: "4 goals, Bad → 2", numGoals: 4, capacity: "Bad", expectedBreadth: 2 },
    { name: "4 goals, Worst → 1", numGoals: 4, capacity: "Worst", expectedBreadth: 1 },
    // N = 3
    { name: "3 goals, Good → all 3", numGoals: 3, capacity: "Good", expectedBreadth: 3 },
    { name: "3 goals, Average → 2", numGoals: 3, capacity: "Average", expectedBreadth: 2 },
    { name: "3 goals, Bad → 1", numGoals: 3, capacity: "Bad", expectedBreadth: 1 },
    { name: "3 goals, Worst → 1", numGoals: 3, capacity: "Worst", expectedBreadth: 1 },
    // N = 5
    { name: "5 goals, Good → all 5", numGoals: 5, capacity: "Good", expectedBreadth: 5 },
    { name: "5 goals, Average → 3", numGoals: 5, capacity: "Average", expectedBreadth: 3 },
    { name: "5 goals, Bad → 2", numGoals: 5, capacity: "Bad", expectedBreadth: 2 },
    { name: "5 goals, Worst → 1", numGoals: 5, capacity: "Worst", expectedBreadth: 1 },
  ];

  it.each(breadthCases)("$name", ({ numGoals, capacity, expectedBreadth }) => {
    const goals = makeGoals(numGoals);
    const items = composeAssignment(capacity, goals);
    const goalIds = [...new Set(items.map((i) => i.goalId))];
    expect(goalIds).toHaveLength(expectedBreadth);
    // Must be the top-ranked goals (goal-1 through goal-expectedBreadth)
    expect(goalIds).toEqual(
      Array.from({ length: expectedBreadth }, (_, i) => `goal-${i + 1}`),
    );
  });
});

describe("composeAssignment — gear degradation & skip", () => {
  it("degrades to nearest lower Gear when goal has no task at exact Gear", () => {
    const goal = {
      id: "goal-1",
      tasks: [
        { description: "Only a Gear-2 task", gear: 2 },
        { description: "Safety net", gear: 1 },
      ],
    };
    // Average → Gear 3, but goal has nothing at Gear 3 → degrades to Gear 2 (nearest, not Gear 1)
    const items = composeAssignment("Average", [goal]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ taskDescription: "Only a Gear-2 task", gear: 2 });
  });

  it("includes all tasks at the degraded Gear, not just one", () => {
    const goal = {
      id: "goal-1",
      tasks: [
        { description: "Degrade task A", gear: 2 },
        { description: "Degrade task B", gear: 2 },
      ],
    };
    // Good → Gear 4; degrades to Gear 2; both Gear-2 tasks should be included
    const items = composeAssignment("Good", [goal]);
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.taskDescription)).toEqual([
      "Degrade task A",
      "Degrade task B",
    ]);
  });

  it("skips a goal that has no tasks at or below the day's Gear", () => {
    const goal = {
      id: "goal-1",
      tasks: [
        { description: "High-gear only", gear: 4 },
        { description: "Also high-gear", gear: 3 },
      ],
    };
    // Bad → Gear 2; goal has nothing at Gear 1 or Gear 2 → goal is skipped
    const items = composeAssignment("Bad", [goal]);
    expect(items).toHaveLength(0);
  });
});
