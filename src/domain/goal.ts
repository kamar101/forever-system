export const MAX_ACTIVE_GOALS = 5;

/**
 * A Goal can be activated only if it has at least one Gear-1 Task.
 * Gear 1 is the worst-day safety net — without it, any bad day would leave
 * the user with no Assignment item for this Goal.
 */
export function canActivateGoal(goal: { tasks: { gear: number }[] }): boolean {
  return goal.tasks.some((t) => t.gear === 1);
}
