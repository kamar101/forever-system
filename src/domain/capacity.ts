// Capacity → Gear mapping.
//
// Capacity is the user's self-reported ability to act on a given Day, chosen
// from Good / Average / Bad / Worst. It maps 1:1 to a Gear (effort level 1–4),
// where Good is the most effort (Gear 4) and Worst is the safety-net minimum
// (Gear 1). See CONTEXT.md.
//
// This is the first pure domain function and exists in Slice 0 to establish the
// table-driven test convention the rest of the domain layer follows.

export const CAPACITIES = ["Good", "Average", "Bad", "Worst"] as const;
export type Capacity = (typeof CAPACITIES)[number];

/** A Gear is an effort level from 1 (worst-day minimum) to 4 (best-day max). */
export type Gear = 1 | 2 | 3 | 4;

const CAPACITY_TO_GEAR: Record<Capacity, Gear> = {
  Good: 4,
  Average: 3,
  Bad: 2,
  Worst: 1,
};

/** Map a Capacity to its Gear (effort level). */
export function capacityToGear(capacity: Capacity): Gear {
  return CAPACITY_TO_GEAR[capacity];
}
