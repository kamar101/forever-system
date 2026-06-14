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
 * Active Goals. In the single-Goal case (Slice 4), Capacity maps 1:1 to a
 * Gear and all Tasks at exactly that Gear are included. Multi-Goal breadth
 * selection (Slice 5) will expand `rankedActiveGoals` usage.
 */
export function composeAssignment(
  capacity: Capacity,
  rankedActiveGoals: GoalForAssignment[],
): AssignmentItem[] {
  const gear = capacityToGear(capacity);
  const items: AssignmentItem[] = [];

  for (const goal of rankedActiveGoals) {
    for (const task of goal.tasks) {
      if (task.gear === gear) {
        items.push({
          goalId: goal.id,
          taskDescription: task.description,
          gear,
          completed: false,
        });
      }
    }
  }

  return items;
}
