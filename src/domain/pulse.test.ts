import { describe, expect, it } from "vitest";
import { nextPulseSequence } from "./pulse";

describe("nextPulseSequence", () => {
  it("the first Pulse of the Day is sequence 1", () => {
    expect(nextPulseSequence(null)).toBe(1);
  });

  it("re-Pulsing after the initial Pulse is sequence 2", () => {
    expect(nextPulseSequence(1)).toBe(2);
  });

  it("a second re-Pulse is rejected once the cap is reached", () => {
    expect(nextPulseSequence(2)).toBeNull();
  });
});
