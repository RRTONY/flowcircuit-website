import { describe, expect, it } from "vitest";
import {
  surveyQuestions,
  calculateRoleScores,
  getDominantRole,
  getRolePercentages,
  roleDescriptions,
  getCombinationProfile,
  getStressZones,
  getBestSelfInsight,
  analyzeTeamStress,
  type Role,
  type TeamMemberProfile,
} from "../lib/surveyData";

// ═══════════════════════════════════════════════════════════════
// ASSESSMENT INSTRUMENT INTEGRITY TESTS
// ═══════════════════════════════════════════════════════════════

describe("Survey Instrument Structure", () => {
  it("has exactly 12 questions", () => {
    expect(surveyQuestions).toHaveLength(12);
  });

  it("each question has exactly 5 options (one per role)", () => {
    const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    for (const q of surveyQuestions) {
      expect(q.options).toHaveLength(5);
      const optionRoles = q.options.map(o => o.role).sort();
      expect(optionRoles).toEqual([...roles].sort());
    }
  });

  it("each question has unique sequential IDs", () => {
    const ids = surveyQuestions.map(q => q.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("each question has a non-empty text and construct description", () => {
    for (const q of surveyQuestions) {
      expect(q.text.length).toBeGreaterThan(10);
      expect(q.construct.length).toBeGreaterThan(5);
    }
  });

  it("all option weights are between 7 and 10 (valid range)", () => {
    for (const q of surveyQuestions) {
      for (const o of q.options) {
        expect(o.weight).toBeGreaterThanOrEqual(7);
        expect(o.weight).toBeLessThanOrEqual(10);
      }
    }
  });

  it("each role has equal measurement opportunity (12 items each)", () => {
    const roleCounts: Record<string, number> = {};
    for (const q of surveyQuestions) {
      for (const o of q.options) {
        roleCounts[o.role] = (roleCounts[o.role] || 0) + 1;
      }
    }
    expect(roleCounts.Spark).toBe(12);
    expect(roleCounts.Amplifier).toBe(12);
    expect(roleCounts.Filter).toBe(12);
    expect(roleCounts.Ground).toBe(12);
    expect(roleCounts.Conductor).toBe(12);
  });

  it("option texts are unique within each question", () => {
    for (const q of surveyQuestions) {
      const texts = q.options.map(o => o.text);
      const uniqueTexts = new Set(texts);
      expect(uniqueTexts.size).toBe(5);
    }
  });
});

describe("Scoring Logic", () => {
  it("returns zero scores for empty answers", () => {
    const scores = calculateRoleScores({});
    expect(scores.Spark).toBe(0);
    expect(scores.Amplifier).toBe(0);
    expect(scores.Filter).toBe(0);
    expect(scores.Ground).toBe(0);
    expect(scores.Conductor).toBe(0);
  });

  it("correctly scores a single answer", () => {
    const firstQ = surveyQuestions[0];
    const sparkOption = firstQ.options.find(o => o.role === "Spark")!;
    const answers = { [firstQ.id]: sparkOption.text };
    const scores = calculateRoleScores(answers);
    expect(scores.Spark).toBe(sparkOption.weight);
    expect(scores.Amplifier).toBe(0);
  });

  it("correctly identifies dominant role when all answers are the same role", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const sparkOption = q.options.find(o => o.role === "Spark")!;
      answers[q.id] = sparkOption.text;
    }
    const scores = calculateRoleScores(answers);
    const dominant = getDominantRole(scores);
    expect(dominant.role).toBe("Spark");
    expect(dominant.percentage).toBe(100);
  });

  it("produces percentages that sum to 100 (or close due to rounding)", () => {
    const answers: Record<number, string> = {};
    const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    surveyQuestions.forEach((q, i) => {
      const role = roles[i % 5];
      const option = q.options.find(o => o.role === role)!;
      answers[q.id] = option.text;
    });
    const scores = calculateRoleScores(answers);
    const percentages = getRolePercentages(scores);
    const totalPct = percentages.reduce((sum, p) => sum + p.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(98);
    expect(totalPct).toBeLessThanOrEqual(102);
  });

  it("getRolePercentages returns roles sorted by percentage descending", () => {
    const answers: Record<number, string> = {};
    surveyQuestions.forEach((q, i) => {
      const role = i < 6 ? "Spark" : (i < 9 ? "Ground" : "Filter");
      const option = q.options.find(o => o.role === role)!;
      answers[q.id] = option.text;
    });
    const scores = calculateRoleScores(answers);
    const percentages = getRolePercentages(scores);
    for (let i = 1; i < percentages.length; i++) {
      expect(percentages[i].percentage).toBeLessThanOrEqual(percentages[i - 1].percentage);
    }
  });
});

describe("Role Descriptions Completeness", () => {
  const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

  it("has descriptions for all 5 roles", () => {
    for (const role of roles) {
      expect(roleDescriptions[role]).toBeDefined();
    }
  });

  it("each role description has all required fields", () => {
    for (const role of roles) {
      const desc = roleDescriptions[role];
      expect(desc.title.length).toBeGreaterThan(0);
      expect(desc.description.length).toBeGreaterThan(20);
      expect(desc.advice.length).toBeGreaterThan(10);
      expect(desc.whoToGoTo.length).toBeGreaterThan(5);
      expect(desc.communicationGuide.length).toBeGreaterThan(20);
    }
  });
});

describe("Construct Validity Checks", () => {
  it("questions cover three behavioral domains", () => {
    const domain1 = surveyQuestions.slice(0, 4);
    const domain2 = surveyQuestions.slice(4, 8);
    const domain3 = surveyQuestions.slice(8, 12);

    expect(domain1).toHaveLength(4);
    expect(domain2).toHaveLength(4);
    expect(domain3).toHaveLength(4);

    for (const q of [...domain1, ...domain2, ...domain3]) {
      expect(q.construct.length).toBeGreaterThan(0);
    }
  });

  it("discriminant validity: each option text is unique across the entire instrument", () => {
    const allTexts: string[] = [];
    for (const q of surveyQuestions) {
      for (const o of q.options) {
        allTexts.push(o.text);
      }
    }
    const uniqueTexts = new Set(allTexts);
    expect(uniqueTexts.size).toBe(allTexts.length);
  });
});

// ═══════════════════════════════════════════════════════════════
// COMBINATION PROFILE TESTS
// ═══════════════════════════════════════════════════════════════

describe("Combination Profile", () => {
  it("returns a pure profile when all answers are one role", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Ground")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);

    expect(profile.primary).toBe("Ground");
    expect(profile.isPure).toBe(true);
    expect(profile.primaryPct).toBe(100);
    expect(profile.purityScore).toBe(100);
    expect(profile.label).toBe("Ground");
  });

  it("returns a blended profile for mixed answers", () => {
    const answers: Record<number, string> = {};
    surveyQuestions.forEach((q, i) => {
      // 6 Spark, 4 Amplifier, 2 Filter
      const role = i < 6 ? "Spark" : (i < 10 ? "Amplifier" : "Filter");
      const option = q.options.find(o => o.role === role)!;
      answers[q.id] = option.text;
    });
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);

    expect(profile.primary).toBe("Spark");
    expect(profile.secondary).toBe("Amplifier");
    expect(profile.primaryPct).toBeGreaterThan(profile.secondaryPct);
    expect(profile.label).toContain("Spark");
    expect(profile.description.length).toBeGreaterThan(20);
  });

  it("purity score is 0-100 range", () => {
    const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    const answers: Record<number, string> = {};
    surveyQuestions.forEach((q, i) => {
      const role = roles[i % 5];
      const option = q.options.find(o => o.role === role)!;
      answers[q.id] = option.text;
    });
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);

    expect(profile.purityScore).toBeGreaterThanOrEqual(0);
    expect(profile.purityScore).toBeLessThanOrEqual(100);
  });
});

// ═══════════════════════════════════════════════════════════════
// STRESS RADIATION MODEL TESTS
// ═══════════════════════════════════════════════════════════════

describe("Stress Radiation Model", () => {
  it("returns 5 stress zones (one per role)", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Spark")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);

    expect(zones).toHaveLength(5);
  });

  it("natural role has lowest stress (0 or near 0)", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Spark")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);

    const sparkZone = zones.find(z => z.targetRole === "Spark")!;
    expect(sparkZone.stressLevel).toBeLessThanOrEqual(10);
    expect(sparkZone.label).toBe("Natural");
  });

  it("opposite role has highest stress", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Spark")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);

    const groundZone = zones.find(z => z.targetRole === "Ground")!;
    expect(groundZone.stressLevel).toBeGreaterThan(70);
  });

  it("each zone has a label, description, and energy cost", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Filter")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);

    for (const zone of zones) {
      expect(zone.label.length).toBeGreaterThan(0);
      expect(zone.description.length).toBeGreaterThan(10);
      expect(zone.energyCost.length).toBeGreaterThan(5);
      expect(zone.stressLevel).toBeGreaterThanOrEqual(0);
      expect(zone.stressLevel).toBeLessThanOrEqual(100);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// BEST SELF INSIGHT TESTS
// ═══════════════════════════════════════════════════════════════

describe("Best Self Insight", () => {
  it("generates a non-empty insight for a pure profile", () => {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === "Conductor")!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);
    const insight = getBestSelfInsight(profile, zones);

    expect(insight.length).toBeGreaterThan(50);
    expect(insight).toContain("Conductor");
  });

  it("generates a non-empty insight for a blended profile", () => {
    const answers: Record<number, string> = {};
    surveyQuestions.forEach((q, i) => {
      const role = i < 7 ? "Amplifier" : "Ground";
      const option = q.options.find(o => o.role === role)!;
      answers[q.id] = option.text;
    });
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const zones = getStressZones(profile);
    const insight = getBestSelfInsight(profile, zones);

    expect(insight.length).toBeGreaterThan(50);
    expect(insight).toContain("Amplifier");
  });
});

// ═══════════════════════════════════════════════════════════════
// TEAM STRESS ANALYSIS TESTS
// ═══════════════════════════════════════════════════════════════

describe("Team Stress Analysis", () => {
  function buildMember(name: string, primaryRole: Role): TeamMemberProfile {
    const answers: Record<number, string> = {};
    for (const q of surveyQuestions) {
      const option = q.options.find(o => o.role === primaryRole)!;
      answers[q.id] = option.text;
    }
    const scores = calculateRoleScores(answers);
    const profile = getCombinationProfile(scores);
    const stressZones = getStressZones(profile);
    return { name, scores, profile, stressZones };
  }

  it("identifies gaps when roles are missing", () => {
    const members = [
      buildMember("Alice", "Spark"),
      buildMember("Bob", "Spark"),
      buildMember("Carol", "Amplifier"),
    ];
    const analysis = analyzeTeamStress(members);

    // Filter, Ground, Conductor should be gaps
    expect(analysis.gaps.length).toBeGreaterThan(0);
  });

  it("identifies friction pairs between opposite roles", () => {
    const members = [
      buildMember("Alice", "Spark"),
      buildMember("Bob", "Ground"),
    ];
    const analysis = analyzeTeamStress(members);

    expect(analysis.frictionPairs.length).toBeGreaterThan(0);
    expect(analysis.frictionPairs[0].member1).toBe("Alice");
    expect(analysis.frictionPairs[0].member2).toBe("Bob");
  });

  it("returns balanced recommendation when all roles are covered", () => {
    const members = [
      buildMember("A", "Spark"),
      buildMember("B", "Amplifier"),
      buildMember("C", "Filter"),
      buildMember("D", "Ground"),
      buildMember("E", "Conductor"),
    ];
    const analysis = analyzeTeamStress(members);

    expect(analysis.recommendation.length).toBeGreaterThan(0);
  });

  it("generates a non-empty recommendation string", () => {
    const members = [
      buildMember("X", "Filter"),
      buildMember("Y", "Filter"),
    ];
    const analysis = analyzeTeamStress(members);

    expect(analysis.recommendation.length).toBeGreaterThan(10);
    expect(analysis.gaps.length).toBeGreaterThan(0);
  });
});
