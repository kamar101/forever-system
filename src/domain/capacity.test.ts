import { describe, expect, it } from "vitest";
import { capacityToGear, type Capacity, type Gear } from "./capacity";

// Table-driven test convention for the domain layer.
//
// Each domain function gets a `cases` table of { name, input, expected } rows
// and a single `it.each` that asserts the pure mapping. Later slices
// (Capacity→breadth, Playbook selection, degrade) follow this same shape.

describe("capacityToGear", () => {
  const cases: { name: string; capacity: Capacity; expected: Gear }[] = [
    { name: "Good is the best day → Gear 4", capacity: "Good", expected: 4 },
    { name: "Average → Gear 3", capacity: "Average", expected: 3 },
    { name: "Bad → Gear 2", capacity: "Bad", expected: 2 },
    { name: "Worst is the safety net → Gear 1", capacity: "Worst", expected: 1 },
  ];

  it.each(cases)("$name", ({ capacity, expected }) => {
    expect(capacityToGear(capacity)).toBe(expected);
  });
});
