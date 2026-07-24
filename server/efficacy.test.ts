import { describe, it, expect } from "vitest";
import efficacyData from "../lib/efficacyData.json";

describe("Efficacy Data Validation", () => {
  it("should have all required top-level keys", () => {
    expect(efficacyData).toHaveProperty("simulation");
    expect(efficacyData).toHaveProperty("classification_accuracy");
    expect(efficacyData).toHaveProperty("differentiation");
    expect(efficacyData).toHaveProperty("entropy");
    expect(efficacyData).toHaveProperty("test_retest_reliability");
    expect(efficacyData).toHaveProperty("faking_resistance");
    expect(efficacyData).toHaveProperty("role_distribution");
  });

  it("should have correct simulation parameters", () => {
    expect(efficacyData.simulation.n_respondents).toBe(10000);
    expect(efficacyData.simulation.n_retest).toBe(2000);
    expect(efficacyData.simulation.n_faking).toBe(2000);
    expect(efficacyData.simulation.seed).toBe(42);
  });

  it("forced-rank accuracy should exceed Likert accuracy", () => {
    expect(efficacyData.classification_accuracy.forced_rank).toBeGreaterThan(
      efficacyData.classification_accuracy.likert
    );
  });

  it("forced-rank accuracy should be at least 85%", () => {
    expect(efficacyData.classification_accuracy.forced_rank).toBeGreaterThanOrEqual(85);
  });

  it("improvement should equal forced_rank minus likert", () => {
    const expected = +(
      efficacyData.classification_accuracy.forced_rank -
      efficacyData.classification_accuracy.likert
    ).toFixed(1);
    expect(efficacyData.classification_accuracy.improvement).toBe(expected);
  });

  it("forced-rank test-retest reliability should exceed 0.80 threshold", () => {
    expect(efficacyData.test_retest_reliability.forced_avg_r).toBeGreaterThan(0.80);
  });

  it("forced-rank reliability should exceed Likert reliability", () => {
    expect(efficacyData.test_retest_reliability.forced_avg_r).toBeGreaterThan(
      efficacyData.test_retest_reliability.likert_avg_r
    );
  });

  it("role distribution should sum to n_respondents for both methods", () => {
    const likertTotal = Object.values(efficacyData.role_distribution.likert).reduce(
      (a, b) => a + b,
      0
    );
    const forcedTotal = Object.values(efficacyData.role_distribution.forced).reduce(
      (a, b) => a + b,
      0
    );
    expect(likertTotal).toBe(efficacyData.simulation.n_respondents);
    expect(forcedTotal).toBe(efficacyData.simulation.n_respondents);
  });

  it("forced-rank distribution should be more balanced than Likert", () => {
    const ideal = efficacyData.simulation.n_respondents / 5;
    const likertDeviation = Object.values(efficacyData.role_distribution.likert).reduce(
      (sum, count) => sum + Math.abs(count - ideal),
      0
    );
    const forcedDeviation = Object.values(efficacyData.role_distribution.forced).reduce(
      (sum, count) => sum + Math.abs(count - ideal),
      0
    );
    expect(forcedDeviation).toBeLessThan(likertDeviation);
  });

  it("entropy values should be between 0 and max_entropy", () => {
    expect(efficacyData.entropy.likert_avg).toBeGreaterThan(0);
    expect(efficacyData.entropy.likert_avg).toBeLessThanOrEqual(efficacyData.entropy.max_entropy);
    expect(efficacyData.entropy.forced_avg).toBeGreaterThan(0);
    expect(efficacyData.entropy.forced_avg).toBeLessThanOrEqual(efficacyData.entropy.max_entropy);
  });

  it("forced-rank entropy should be higher (more balanced) than Likert", () => {
    expect(efficacyData.entropy.forced_avg).toBeGreaterThan(efficacyData.entropy.likert_avg);
  });

  it("both faking rates should be between 0 and 100", () => {
    expect(efficacyData.faking_resistance.likert_fake_success_rate).toBeGreaterThanOrEqual(0);
    expect(efficacyData.faking_resistance.likert_fake_success_rate).toBeLessThanOrEqual(100);
    expect(efficacyData.faking_resistance.forced_fake_success_rate).toBeGreaterThanOrEqual(0);
    expect(efficacyData.faking_resistance.forced_fake_success_rate).toBeLessThanOrEqual(100);
  });

  it("all five roles should be present in both distributions", () => {
    const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    for (const role of roles) {
      expect(efficacyData.role_distribution.likert).toHaveProperty(role);
      expect(efficacyData.role_distribution.forced).toHaveProperty(role);
    }
  });
});
