import type { Role } from "./surveyData";

/**
 * Deep Calibration — Forced-Ranking Ipsative Assessment
 *
 * Each set contains 4 statements. The user ranks them from
 * "Most Like Me" (rank 1) to "Least Like Me" (rank 4).
 *
 * This eliminates social desirability bias because you MUST
 * sacrifice one role to claim another. No more "I'm good at
 * everything" — the data forces differentiation.
 *
 * 15 sets × 4 statements = 60 data points across all 5 roles.
 * Each role appears exactly 12 times (3 sets × 4 appearances).
 */

export interface CalibrationStatement {
  id: string;
  text: string;
  role: Role;
}

export interface CalibrationSet {
  id: number;
  context: string; // The scenario framing
  statements: CalibrationStatement[];
}

export const calibrationSets: CalibrationSet[] = [
  // --- SET 1: Under Pressure ---
  {
    id: 1,
    context: "When a deadline is moved up by two weeks and the team is panicking...",
    statements: [
      { id: "1a", text: "I immediately start generating alternative approaches we haven't considered", role: "Spark" },
      { id: "1b", text: "I rally the team's energy and reframe the crisis as an opportunity", role: "Amplifier" },
      { id: "1c", text: "I identify what we can cut without compromising quality", role: "Filter" },
      { id: "1d", text: "I rebuild the timeline and start executing the critical path", role: "Ground" },
    ]
  },
  // --- SET 2: New Hire ---
  {
    id: 2,
    context: "A talented new person joins your team. Your first instinct is to...",
    statements: [
      { id: "2a", text: "Share all the big ideas we haven't had time to explore yet", role: "Spark" },
      { id: "2b", text: "Introduce them to everyone and make them feel the team's energy", role: "Amplifier" },
      { id: "2c", text: "Assess what skills they bring and where the gaps still are", role: "Filter" },
      { id: "2d", text: "Get them set up with tools, access, and their first deliverable", role: "Ground" },
    ]
  },
  // --- SET 3: Conflict ---
  {
    id: 3,
    context: "Two team members disagree strongly about the direction of a project...",
    statements: [
      { id: "3a", text: "I propose a third option neither of them has considered", role: "Spark" },
      { id: "3b", text: "I help each person feel heard and find the emotional common ground", role: "Conductor" },
      { id: "3c", text: "I analyze both positions objectively and present the data", role: "Filter" },
      { id: "3d", text: "I suggest we test both approaches with a quick prototype", role: "Ground" },
    ]
  },
  // --- SET 4: Blank Canvas ---
  {
    id: 4,
    context: "You're given complete freedom to spend a day however you want at work...",
    statements: [
      { id: "4a", text: "I explore a wild idea that's been nagging me for weeks", role: "Spark" },
      { id: "4b", text: "I connect with people outside my team to build new relationships", role: "Amplifier" },
      { id: "4c", text: "I audit our current processes and find the inefficiencies", role: "Filter" },
      { id: "4d", text: "I clear the backlog of tasks that have been piling up", role: "Ground" },
    ]
  },
  // --- SET 5: Presenting Results ---
  {
    id: 5,
    context: "You need to present your team's quarterly results to leadership...",
    statements: [
      { id: "5a", text: "I focus on the vision — where we're going and what's possible next", role: "Spark" },
      { id: "5b", text: "I craft a compelling narrative that makes the numbers feel alive", role: "Amplifier" },
      { id: "5c", text: "I present the honest picture — what worked, what didn't, and why", role: "Filter" },
      { id: "5d", text: "I show the concrete deliverables and milestones we hit", role: "Ground" },
    ]
  },
  // --- SET 6: Team Energy ---
  {
    id: 6,
    context: "Your team's energy has been low for weeks. Something needs to change...",
    statements: [
      { id: "6a", text: "I inject a new challenge or moonshot idea to reignite excitement", role: "Spark" },
      { id: "6b", text: "I organize a team event or offsite to rebuild connection", role: "Amplifier" },
      { id: "6c", text: "I diagnose the root cause — is it workload, leadership, or culture?", role: "Filter" },
      { id: "6d", text: "I check who's overloaded and redistribute the work", role: "Conductor" },
    ]
  },
  // --- SET 7: Innovation vs. Execution ---
  {
    id: 7,
    context: "The company needs to both innovate AND ship reliably. You naturally gravitate toward...",
    statements: [
      { id: "7a", text: "Protecting time for experimentation, even when shipping pressure is high", role: "Spark" },
      { id: "7b", text: "Making sure the team's wins are visible and celebrated across the org", role: "Amplifier" },
      { id: "7c", text: "Ensuring we don't ship anything that isn't ready, even if it means delays", role: "Filter" },
      { id: "7d", text: "Building systems that let us do both — reliable processes with innovation sprints", role: "Conductor" },
    ]
  },
  // --- SET 8: Feedback ---
  {
    id: 8,
    context: "Someone asks for your honest feedback on their work...",
    statements: [
      { id: "8a", text: "I see what it COULD become and share the bigger possibilities", role: "Spark" },
      { id: "8b", text: "I focus on what's working and how to amplify those strengths", role: "Amplifier" },
      { id: "8c", text: "I give direct, specific critique on what needs to improve", role: "Filter" },
      { id: "8d", text: "I suggest concrete next steps to make it better", role: "Ground" },
    ]
  },
  // --- SET 9: Meeting Dynamics ---
  {
    id: 9,
    context: "In a brainstorming meeting that's going in circles...",
    statements: [
      { id: "9a", text: "I throw out a provocative idea to break the pattern", role: "Spark" },
      { id: "9b", text: "I reframe the problem in a way that energizes the room", role: "Amplifier" },
      { id: "9c", text: "I point out that we're avoiding the real issue", role: "Filter" },
      { id: "9d", text: "I step in to facilitate — set a timer, assign roles, create structure", role: "Conductor" },
    ]
  },
  // --- SET 10: Failure ---
  {
    id: 10,
    context: "A major project just failed publicly. Your instinct is to...",
    statements: [
      { id: "10a", text: "Already be thinking about what we build next from the wreckage", role: "Spark" },
      { id: "10b", text: "Control the narrative — communicate what we learned, not just what we lost", role: "Amplifier" },
      { id: "10c", text: "Conduct a thorough post-mortem to understand exactly what went wrong", role: "Filter" },
      { id: "10d", text: "Start fixing what can be salvaged immediately", role: "Ground" },
    ]
  },
  // --- SET 11: Resource Scarcity ---
  {
    id: 11,
    context: "Budget is cut by 30%. You have to make hard choices...",
    statements: [
      { id: "11a", text: "I find creative ways to do more with less — constraints breed innovation", role: "Spark" },
      { id: "11b", text: "I make the case to leadership for why this team deserves more resources", role: "Amplifier" },
      { id: "11c", text: "I ruthlessly prioritize — cut the nice-to-haves, protect the essentials", role: "Filter" },
      { id: "11d", text: "I ensure the remaining team knows exactly who's doing what", role: "Conductor" },
    ]
  },
  // --- SET 12: Long-Term Vision ---
  {
    id: 12,
    context: "Planning the next 3 years for your team or company...",
    statements: [
      { id: "12a", text: "I paint a picture of what's possible that nobody else is imagining", role: "Spark" },
      { id: "12b", text: "I think about how to tell this story in a way that attracts talent and investors", role: "Amplifier" },
      { id: "12c", text: "I stress-test the assumptions — what has to be true for this plan to work?", role: "Filter" },
      { id: "12d", text: "I build the roadmap with milestones, dependencies, and accountability", role: "Ground" },
    ]
  },
  // --- SET 13: Onboarding Yourself ---
  {
    id: 13,
    context: "You just started at a new company. In your first week, you...",
    statements: [
      { id: "13a", text: "Start asking 'why' about everything — challenging assumptions from day one", role: "Spark" },
      { id: "13b", text: "Meet as many people as possible and understand the social dynamics", role: "Amplifier" },
      { id: "13c", text: "Study the existing systems, data, and processes before forming opinions", role: "Filter" },
      { id: "13d", text: "Find a quick win to deliver — prove your value through action", role: "Ground" },
    ]
  },
  // --- SET 14: Recognition ---
  {
    id: 14,
    context: "What kind of recognition means the most to you?",
    statements: [
      { id: "14a", text: "Being known as the person who sees what others can't", role: "Spark" },
      { id: "14b", text: "Being the one everyone wants on their team because I make it better", role: "Conductor" },
      { id: "14c", text: "Being respected for my judgment — people trust my analysis", role: "Filter" },
      { id: "14d", text: "Being the person who actually gets things done, no matter what", role: "Ground" },
    ]
  },
  // --- SET 15: Legacy ---
  {
    id: 15,
    context: "At the end of your career, you want to be remembered as someone who...",
    statements: [
      { id: "15a", text: "Changed the game — introduced ideas that shifted the industry", role: "Spark" },
      { id: "15b", text: "Inspired people — made them believe in something bigger than themselves", role: "Amplifier" },
      { id: "15c", text: "Held the line — never let bad work ship, never compromised on truth", role: "Filter" },
      { id: "15d", text: "Built things that lasted — systems, products, teams that endured", role: "Ground" },
    ]
  },
];

/**
 * Ipsative scoring algorithm.
 *
 * Rank 1 (most like me) = 4 points
 * Rank 2 = 3 points
 * Rank 3 = 2 points
 * Rank 4 (least like me) = 1 point
 *
 * This creates forced differentiation — you can't rate everything high.
 * Total points per set = 10, total across 15 sets = 150.
 * Each role appears 12 times, so max possible per role = 48 (all rank 1).
 */
const RANK_POINTS = [4, 3, 2, 1];

export interface RankingResult {
  setId: number;
  rankings: string[]; // statement IDs ordered most→least
}

export function calculateCalibratedScores(rankings: RankingResult[]): Record<Role, number> {
  const scores: Record<Role, number> = {
    Spark: 0,
    Amplifier: 0,
    Filter: 0,
    Ground: 0,
    Conductor: 0,
  };

  for (const result of rankings) {
    const set = calibrationSets.find(s => s.id === result.setId);
    if (!set) continue;

    result.rankings.forEach((stmtId, rankIndex) => {
      const stmt = set.statements.find(s => s.id === stmtId);
      if (stmt) {
        scores[stmt.role] += RANK_POINTS[rankIndex];
      }
    });
  }

  return scores;
}

/**
 * Convert raw ipsative scores to percentages.
 */
export function scoresToPercentages(scores: Record<Role, number>): Record<Role, number> {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return { Spark: 20, Amplifier: 20, Filter: 20, Ground: 20, Conductor: 20 };
  const pct: Record<string, number> = {};
  for (const [role, score] of Object.entries(scores)) {
    pct[role] = Math.round((score / total) * 100);
  }
  return pct as Record<Role, number>;
}

/**
 * Calculate consistency score (0-100).
 * Measures how consistently the user ranks the same role high or low
 * across different sets. High consistency = more reliable profile.
 */
export function calculateConsistency(rankings: RankingResult[]): number {
  const roleRanks: Record<Role, number[]> = {
    Spark: [], Amplifier: [], Filter: [], Ground: [], Conductor: []
  };

  for (const result of rankings) {
    const set = calibrationSets.find(s => s.id === result.setId);
    if (!set) continue;

    result.rankings.forEach((stmtId, rankIndex) => {
      const stmt = set.statements.find(s => s.id === stmtId);
      if (stmt) {
        roleRanks[stmt.role].push(rankIndex + 1); // 1-4
      }
    });
  }

  // Calculate variance for each role's rankings — lower variance = higher consistency
  let totalVariance = 0;
  let roleCount = 0;
  for (const ranks of Object.values(roleRanks)) {
    if (ranks.length < 2) continue;
    const mean = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    const variance = ranks.reduce((sum, r) => sum + (r - mean) ** 2, 0) / ranks.length;
    totalVariance += variance;
    roleCount++;
  }

  if (roleCount === 0) return 50;
  const avgVariance = totalVariance / roleCount;
  // Max possible variance with 4 ranks is ~1.25, map to 0-100 inversely
  const consistency = Math.max(0, Math.min(100, Math.round((1 - avgVariance / 1.5) * 100)));
  return consistency;
}

export function getDominantRole(scores: Record<Role, number>): Role {
  return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as Role;
}
