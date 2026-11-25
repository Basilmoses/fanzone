import { describe, expect, it } from "vitest";
import { accuracy, computePoints } from "@/lib/fanzone/scoring";
describe("scoring", () => {
  it("gives 100 per correct answer plus 1 per second left", () => expect(computePoints(7, 45)).toBe(745));
  it("gives zero points when no answer is correct", () => expect(computePoints(0, 90)).toBe(0));
  it("computes accuracy percent", () => expect(accuracy(7, 10)).toBe(70));
});
