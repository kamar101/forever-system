import { capacityToGear, type Capacity } from "./capacity";
import type { Gear } from "./gear";

export type AssignmentItem = {
  goalId: string;
  taskDescription: string;
  gear: Gear;
  completed: boolean;
};

type GoalForAssignment = {
  id: string;
  tasks: { description: string; gear: number }[];
};

/**
 * Compose an Assignment from the user's declared Capacity and their ranked
 * Active Goals. Capacity controls both intensity (Gear) and breadth (how many
 * Goals are in-scope): Good spans all Goals; Worst spans only the top-ranked.
 * Within each in-breadth Goal, the day's Gear is tried first; if absent, the
 * nearest lower Gear with Tasks is used; if nothing is at or below the Gear,
 * that Goal is skipped.
 */
export function composeAssignment(
  capacity: Capacity,
  rankedActiveGoals: GoalForAssignment[],
): AssignmentItem[] {
  const gear = capacityToGear(capacity);
  const breadth = Math.max(
    1,
    Math.floor((rankedActiveGoals.length * gear) / 4),
  );
  const items: AssignmentItem[] = [];

  for (const goal of rankedActiveGoals.slice(0, breadth)) {
    let effectiveGear = gear;
    if (!goal.tasks.some((t) => t.gear === gear)) {
      const lowerGears = goal.tasks.map((t) => t.gear).filter((g) => g < gear);
      if (lowerGears.length === 0) continue; // nothing at or below day's gear — skip
      effectiveGear = Math.max(...lowerGears) as Gear;
    }
    for (const task of goal.tasks) {
      if (task.gear === effectiveGear) {
        items.push({
          goalId: goal.id,
          taskDescription: task.description,
          gear: effectiveGear,
          completed: false,
        });
      }
    }
  }

  return items;
}
