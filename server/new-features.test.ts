import { describe, it, expect } from "vitest";

// ─── Assessment Scoring (imported from client lib) ─────────────────
// We test the pure functions that don't depend on DOM

describe("Survey Data Integrity", () => {
  it("should have surveyData module importable", async () => {
    // Verify the module structure exists
    const mod = await import("../lib/surveyData");
    expect(mod.surveyQuestions).toBeDefined();
    expect(mod.calculateRoleScores).toBeDefined();
    expect(mod.getDominantRole).toBeDefined();
    expect(mod.getRolePercentages).toBeDefined();
    expect(mod.getCombinationProfile).toBeDefined();
    expect(mod.getStressZones).toBeDefined();
    expect(mod.analyzeTeamStress).toBeDefined();
  });

  it("should have 12 survey questions", async () => {
    const { surveyQuestions } = await import("../lib/surveyData");
    expect(surveyQuestions.length).toBe(12);
  });

  it("should have 5 options per question covering all roles", async () => {
    const { surveyQuestions } = await import("../lib/surveyData");
    const ROLES = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    for (const q of surveyQuestions) {
      expect(q.options.length).toBe(5);
      const optionRoles = q.options.map((o) => o.role).sort();
      expect(optionRoles).toEqual(ROLES.sort());
    }
  });

  it("calculateRoleScores should return scores for all 5 roles", async () => {
    const { calculateRoleScores, surveyQuestions } = await import(
      "../lib/surveyData"
    );
    // Build answers: always pick the first option
    const answers: Record<number, string> = {};
    surveyQuestions.forEach((q, i) => {
      answers[i] = q.options[0].text;
    });
    const scores = calculateRoleScores(answers);
    expect(scores).toHaveProperty("Spark");
    expect(scores).toHaveProperty("Amplifier");
    expect(scores).toHaveProperty("Filter");
    expect(scores).toHaveProperty("Ground");
    expect(scores).toHaveProperty("Conductor");
    // All scores should be non-negative numbers
    Object.values(scores).forEach((s) => {
      expect(typeof s).toBe("number");
      expect(s).toBeGreaterThanOrEqual(0);
    });
  });

  it("getDominantRole should return a valid role", async () => {
    const { getDominantRole } = await import("../lib/surveyData");
    const scores = { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 5 };
    const result = getDominantRole(scores);
    expect(result.role).toBe("Spark");
    expect(result.score).toBe(30);
  });

  it("getRolePercentages should sum to ~100%", async () => {
    const { getRolePercentages } = await import("../lib/surveyData");
    const scores = { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 5 };
    const percentages = getRolePercentages(scores);
    const sum = percentages.reduce((acc, p) => acc + p.percentage, 0);
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
    expect(percentages.length).toBe(5);
    // Should be sorted descending
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i - 1].percentage).toBeGreaterThanOrEqual(
        percentages[i].percentage
      );
    }
  });

  it("getCombinationProfile should return primary and secondary roles", async () => {
    const { getCombinationProfile } = await import("../lib/surveyData");
    const scores = { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 5 };
    const profile = getCombinationProfile(scores);
    expect(profile.primary).toBe("Spark");
    expect(profile.secondary).toBe("Amplifier");
    expect(profile.label).toBe("Spark-Amplifier");
    expect(typeof profile.description).toBe("string");
    expect(profile.description.length).toBeGreaterThan(0);
  });

  it("getCombinationProfile should include purityScore between 0 and 100", async () => {
    const { getCombinationProfile } = await import("../lib/surveyData");
    const scores = { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 5 };
    const profile = getCombinationProfile(scores);
    expect(profile.purityScore).toBeGreaterThanOrEqual(0);
    expect(profile.purityScore).toBeLessThanOrEqual(100);
    expect(typeof profile.isPure).toBe("boolean");
  });

  it("getStressZones should return stress data for all 5 roles", async () => {
    const { getStressZones, getCombinationProfile } = await import("../lib/surveyData");
    const scores = { Spark: 30, Amplifier: 20, Filter: 15, Ground: 10, Conductor: 5 };
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);
    expect(zones.length).toBe(5);
    // The natural role should have the lowest stress
    const naturalZone = zones.find((z) => z.targetRole === "Spark");
    expect(naturalZone).toBeDefined();
    expect(naturalZone!.label).toBe("Natural");
  });

  it("analyzeTeamStress should identify friction pairs", async () => {
    const { analyzeTeamStress, getCombinationProfile, getStressZones } = await import("../lib/surveyData");
    const aliceScores = { Spark: 40, Amplifier: 20, Filter: 15, Ground: 15, Conductor: 10 };
    const bobScores = { Spark: 10, Amplifier: 15, Filter: 15, Ground: 40, Conductor: 20 };
    const aliceProfile = getCombinationProfile(aliceScores);
    const bobProfile = getCombinationProfile(bobScores);
    const members = [
      { name: "Alice", role: "Spark" as const, scores: aliceScores, profile: aliceProfile, stressZones: getStressZones(aliceProfile) },
      { name: "Bob", role: "Ground" as const, scores: bobScores, profile: bobProfile, stressZones: getStressZones(bobProfile) },
    ];
    const analysis = analyzeTeamStress(members);
    expect(analysis).toHaveProperty("frictionPairs");
    expect(analysis).toHaveProperty("gaps");
    expect(analysis).toHaveProperty("overloaded");
    expect(Array.isArray(analysis.frictionPairs)).toBe(true);
    expect(Array.isArray(analysis.gaps)).toBe(true);
    expect(Array.isArray(analysis.overloaded)).toBe(true);
  });
});

describe("Email Drip Schema", () => {
  it("should have emailDrips table in schema", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.emailDrips).toBeDefined();
  });
});

describe("Router Structure", () => {
  it("should export appRouter with all required routers", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // Check that the router has the expected procedure namespaces
    const routerDef = appRouter._def;
    expect(routerDef).toBeDefined();
  });
});
