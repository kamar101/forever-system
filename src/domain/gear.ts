// Gear helpers for the domain layer.
//
// A Gear is an effort level 1–4 carried by a Task (see capacity.ts for the
// canonical `Gear` type and CONTEXT.md for the definition). A Goal's "Gear N"
// is the pool of its Tasks tagged at that level, so the natural way to present
// a Goal's Tasks is grouped by Gear, best day (4) first.

import type { Gear } from "./capacity";

export type { Gear };

/** All Gears in display order: best day (4) → worst-day safety net (1). */
export const GEARS = [4, 3, 2, 1] as const;

/** Narrow an arbitrary number to a Gear (1–4). */
export function isGear(value: number): value is Gear {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

/**
 * Group a Goal's Tasks into one bucket per Gear, in display order (4 → 1).
 *
 * Every Gear gets an entry even when empty; callers decide whether to render
 * empty buckets. Within a Gear, input order is preserved.
 */
export function groupTasksByGear<T extends { gear: Gear }>(
  tasks: readonly T[],
): { gear: Gear; tasks: T[] }[] {
  return GEARS.map((gear) => ({
    gear,
    tasks: tasks.filter((task) => task.gear === gear),
  }));
}
