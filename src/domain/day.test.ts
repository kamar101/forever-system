import { describe, expect, it } from "vitest";
import { isDayGreen } from "./day";

describe("isDayGreen", () => {
  it("is green when every Assignment item is completed", () => {
    const items = [
      { completed: true },
      { completed: true },
    ];
    expect(isDayGreen(items)).toBe(true);
  });

  it("is not green when some items are still incomplete", () => {
    const items = [
      { completed: true },
      { completed: false },
    ];
    expect(isDayGreen(items)).toBe(false);
  });

  it("is not green when the Assignment has no items (nothing to complete)", () => {
    expect(isDayGreen([])).toBe(false);
  });

  it("a single completed item makes the Day green", () => {
    expect(isDayGreen([{ completed: true }])).toBe(true);
  });

  it("a single incomplete item leaves the Day not green", () => {
    expect(isDayGreen([{ completed: false }])).toBe(false);
  });
});
