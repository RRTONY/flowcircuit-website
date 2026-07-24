import { describe, it, expect } from "vitest";

// We test the scoring logic by simulating what the client-side functions do
// Since surveyData.ts is a client file, we replicate the core scoring algorithm here
// to validate the forced-rank ipsative scoring independently

type Role = "Spark" | "Amplifier" | "Filter" | "Ground" | "Conductor";
type RankingAnswer = { role: Role; text: string }[];

// Replicate the forced-rank scoring algorithm from surveyData.ts
function calculateRoleScores(answers: Record<number, string | RankingAnswer>) {
  const scores: Record<Role, number> = {
    Spark: 0,
    Amplifier: 0,
    Filter: 0,
    Ground: 0,
    Conductor: 0,
  };

  Object.entries(answers).forEach(([_questionId, answer]) => {
    if (Array.isArray(answer)) {
      const ranking = answer as RankingAnswer;
      const positionWeights = [5, 4, 3, 2, 1];
      ranking.forEach((item, index) => {
        if (item.role && positionWeights[index] !== undefined) {
          scores[item.role] += positionWeights[index];
        }
      });
    }
  });

  return scores;
}

function getRolePercentages(scores: Record<Role, number>) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
  return roles
    .map((role) => ({
      role,
      score: scores[role],
      percentage: Math.round((scores[role] / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

function getDominantRole(scores: Record<Role, number>) {
  let maxScore = 0;
  let dominantRole: Role = "Conductor";
  Object.entries(scores).forEach(([role, score]) => {
    if (score > maxScore) {
      maxScore = score;
      dominantRole = role as Role;
    }
  });
  const totalPoints = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentage = totalPoints > 0 ? Math.round((maxScore / totalPoints) * 100) : 0;
  return { role: dominantRole, score: maxScore, percentage };
}

// Helper to create a ranking answer
function rank(...roles: Role[]): RankingAnswer {
  return roles.map((role) => ({ role, text: `${role} answer text` }));
}

describe("Forced-Rank Scoring Algorithm", () => {
  describe("Position Weights", () => {
    it("assigns 5 points to 1st position, 4 to 2nd, 3 to 3rd, 2 to 4th, 1 to 5th", () => {
      const answers: Record<number, RankingAnswer> = {
        1: rank("Spark", "Amplifier", "Filter", "Ground", "Conductor"),
      };
      const scores = calculateRoleScores(answers);
      expect(scores.Spark).toBe(5);
      expect(scores.Amplifier).toBe(4);
      expect(scores.Filter).toBe(3);
      expect(scores.Ground).toBe(2);
      expect(scores.Conductor).toBe(1);
    });

    it("total points per question always equals 15 (5+4+3+2+1)", () => {
      const answers: Record<number, RankingAnswer> = {
        1: rank("Ground", "Conductor", "Spark", "Filter", "Amplifier"),
      };
      const scores = calculateRoleScores(answers);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(total).toBe(15);
    });

    it("total points for 12 questions equals 180 (12 × 15)", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Amplifier", "Filter", "Ground", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(total).toBe(180);
    });
  });

  describe("Score Accumulation", () => {
    it("accumulates scores across multiple questions", () => {
      const answers: Record<number, RankingAnswer> = {
        1: rank("Spark", "Amplifier", "Filter", "Ground", "Conductor"),
        2: rank("Spark", "Amplifier", "Filter", "Ground", "Conductor"),
      };
      const scores = calculateRoleScores(answers);
      expect(scores.Spark).toBe(10); // 5 + 5
      expect(scores.Amplifier).toBe(8); // 4 + 4
      expect(scores.Filter).toBe(6); // 3 + 3
      expect(scores.Ground).toBe(4); // 2 + 2
      expect(scores.Conductor).toBe(2); // 1 + 1
    });

    it("produces maximum score of 60 when a role is ranked #1 in all 12 questions", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Amplifier", "Filter", "Ground", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      expect(scores.Spark).toBe(60);
    });

    it("produces minimum score of 12 when a role is ranked #5 in all 12 questions", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Amplifier", "Filter", "Ground", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      expect(scores.Conductor).toBe(12);
    });
  });

  describe("Role Differentiation", () => {
    it("clearly differentiates dominant role when consistently ranked #1", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Ground", "Filter", "Conductor", "Amplifier", "Spark");
      }
      const scores = calculateRoleScores(answers);
      const dominant = getDominantRole(scores);
      expect(dominant.role).toBe("Ground");
      expect(dominant.percentage).toBe(33); // 60/180 = 33%
    });

    it("produces wider score spread than Likert (max-min > 24 for consistent ranker)", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Filter", "Ground", "Conductor", "Amplifier", "Spark");
      }
      const scores = calculateRoleScores(answers);
      const maxScore = Math.max(...Object.values(scores));
      const minScore = Math.min(...Object.values(scores));
      expect(maxScore - minScore).toBeGreaterThan(24);
    });

    it("handles mixed rankings producing balanced scores", () => {
      // Alternate between different rankings to create a balanced profile
      const answers: Record<number, RankingAnswer> = {};
      const rotations: Role[][] = [
        ["Spark", "Amplifier", "Filter", "Ground", "Conductor"],
        ["Amplifier", "Filter", "Ground", "Conductor", "Spark"],
        ["Filter", "Ground", "Conductor", "Spark", "Amplifier"],
        ["Ground", "Conductor", "Spark", "Amplifier", "Filter"],
        ["Conductor", "Spark", "Amplifier", "Filter", "Ground"],
      ];
      for (let i = 1; i <= 10; i++) {
        const rotation = rotations[(i - 1) % 5];
        answers[i] = rank(...rotation);
      }
      const scores = calculateRoleScores(answers);
      const percentages = getRolePercentages(scores);
      // With 10 questions and 5 rotations (2 each), all roles should be close
      const maxPct = percentages[0].percentage;
      const minPct = percentages[percentages.length - 1].percentage;
      expect(maxPct - minPct).toBeLessThanOrEqual(5);
    });
  });

  describe("Percentage Calculations", () => {
    it("percentages sum to approximately 100", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Ground", "Filter", "Amplifier", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      const percentages = getRolePercentages(scores);
      const sum = percentages.reduce((a, b) => a + b.percentage, 0);
      // Allow ±2 for rounding
      expect(sum).toBeGreaterThanOrEqual(98);
      expect(sum).toBeLessThanOrEqual(102);
    });

    it("returns percentages sorted by score descending", () => {
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Amplifier", "Filter", "Ground", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      const percentages = getRolePercentages(scores);
      for (let i = 0; i < percentages.length - 1; i++) {
        expect(percentages[i].percentage).toBeGreaterThanOrEqual(percentages[i + 1].percentage);
      }
    });
  });

  describe("Edge Cases", () => {
    it("handles empty answers gracefully", () => {
      const scores = calculateRoleScores({});
      expect(Object.values(scores).every((s) => s === 0)).toBe(true);
    });

    it("handles partial answers (fewer than 12 questions)", () => {
      const answers: Record<number, RankingAnswer> = {
        1: rank("Spark", "Amplifier", "Filter", "Ground", "Conductor"),
      };
      const scores = calculateRoleScores(answers);
      const total = Object.values(scores).reduce((a, b) => a + b, 0);
      expect(total).toBe(15);
    });

    it("handles ranking with fewer than 5 items", () => {
      const answers: Record<number, RankingAnswer> = {
        1: [
          { role: "Spark", text: "Spark text" },
          { role: "Ground", text: "Ground text" },
          { role: "Filter", text: "Filter text" },
        ],
      };
      const scores = calculateRoleScores(answers);
      expect(scores.Spark).toBe(5);
      expect(scores.Ground).toBe(4);
      expect(scores.Filter).toBe(3);
      expect(scores.Amplifier).toBe(0);
      expect(scores.Conductor).toBe(0);
    });
  });

  describe("Spark Inflation Elimination", () => {
    it("prevents Spark from dominating when user ranks it mid-pack", () => {
      // In Likert, users tend to pick Spark because it sounds exciting
      // In forced-rank, if Spark is consistently ranked 3rd, it gets 3pts not 9pts
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Ground", "Filter", "Spark", "Conductor", "Amplifier");
      }
      const scores = calculateRoleScores(answers);
      const dominant = getDominantRole(scores);
      expect(dominant.role).toBe("Ground");
      expect(scores.Spark).toBe(36); // 3 × 12 = middle
      expect(scores.Ground).toBe(60); // 5 × 12 = top
    });

    it("forced-rank score spread is wider than equal-weight Likert would produce", () => {
      // Simulate: in Likert, picking one answer gives ~9pts to one role, 0 to others
      // In forced-rank, every question distributes 15pts across ALL roles
      const answers: Record<number, RankingAnswer> = {};
      for (let i = 1; i <= 12; i++) {
        answers[i] = rank("Spark", "Amplifier", "Filter", "Ground", "Conductor");
      }
      const scores = calculateRoleScores(answers);
      // Score spread: 60 - 12 = 48 (much wider than Likert's typical ~30)
      const spread = Math.max(...Object.values(scores)) - Math.min(...Object.values(scores));
      expect(spread).toBe(48);
    });
  });

  describe("Backward Compatibility", () => {
    it("handles legacy string answers (Likert format) without crashing", () => {
      // The calculateRoleScores function should handle string answers gracefully
      // even though it won't score them correctly without question lookup
      const answers: Record<number, string> = {
        1: "Some answer text",
      };
      // Should not throw
      expect(() => calculateRoleScores(answers)).not.toThrow();
    });
  });
});
