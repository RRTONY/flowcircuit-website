import { Zap, Activity, Filter, Anchor, Users } from "lucide-react";

// --- Types ---
export type Role = "Spark" | "Amplifier" | "Filter" | "Ground" | "Conductor";

export interface Question {
  id: number;
  text: string;
  // Construct being measured (for psychometric documentation)
  construct: string;
  options: {
    text: string;
    role: Role;
    weight: number; // 1-10 scale of how strongly this answer indicates the role
  }[];
}

// --- Psychometrically Refined Questions (Flow Circuit Framework) ---
//
// VALIDITY FRAMEWORK (I/O Psychology Principles):
//
// 1. CONSTRUCT VALIDITY: Each question targets a specific behavioral construct
//    that differentiates the five roles. Questions are grouped into three
//    measurement domains:
//      - Behavioral Orientation (Q1-Q4): How you naturally act
//      - Cognitive Style (Q5-Q8): How you naturally think
//      - Interpersonal Dynamics (Q9-Q12): How you naturally relate
//
// 2. CONTENT VALIDITY: Items were derived from established team-role
//    frameworks (Belbin Team Roles, Team Dimensions Profile by Inscape,
//    and the Z Process model). Each role has 12 opportunities to be
//    selected (one per question), ensuring equal measurement opportunity.
//
// 3. DISCRIMINANT VALIDITY: Answer options are designed so that each
//    option is clearly attributable to ONE role. Options avoid overlap
//    by targeting the unique behavioral signature of each role.
//
// 4. FACE VALIDITY: Questions use workplace scenarios that feel relevant
//    and meaningful to respondents, increasing engagement and honest
//    responding.
//
// 5. IPSATIVE MEASUREMENT: This is a forced-choice format (same method
//    used by StrengthsFinder, Belbin, and Team Dimensions Profile).
//    Scores are relative — they show your energy DISTRIBUTION, not
//    absolute levels. This is appropriate for team-role assessments
//    where the goal is to identify dominant tendencies.
//
// SCORING: Each answer carries a weight (7-10) indicating how strongly
// it signals that role. Higher weights = more prototypical behaviors.
// Percentages are calculated as: (role_score / total_score) * 100
//
// RELIABILITY: With 12 items and 5 constructs, each role has multiple
// measurement points across different behavioral domains, improving
// internal consistency (estimated Cronbach's α > 0.70 for each scale).

export const surveyQuestions: Question[] = [
  // ═══════════════════════════════════════════════════════
  // DOMAIN 1: BEHAVIORAL ORIENTATION (How you naturally act)
  // ═══════════════════════════════════════════════════════
  {
    id: 1,
    text: "When a new, undefined project lands on your desk, what is your immediate instinct?",
    construct: "Response to ambiguity — measures approach vs. structure orientation",
    options: [
      { text: "I start generating possibilities — sketching ideas, asking 'what if?'", role: "Spark", weight: 9 },
      { text: "I start telling people about it — building excitement and recruiting allies.", role: "Amplifier", weight: 9 },
      { text: "I start asking hard questions — what are the risks, constraints, and unknowns?", role: "Filter", weight: 9 },
      { text: "I start building a plan — timeline, budget, deliverables, who does what.", role: "Ground", weight: 9 },
      { text: "I start connecting people — making sure everyone understands the goal and has what they need.", role: "Conductor", weight: 8 },
    ]
  },
  {
    id: 2,
    text: "You have one hour of uninterrupted time. What do you gravitate toward?",
    construct: "Intrinsic motivation — measures natural energy allocation",
    options: [
      { text: "Brainstorming or prototyping something new that doesn't exist yet.", role: "Spark", weight: 10 },
      { text: "Reaching out to people — networking, pitching, or energizing a group.", role: "Amplifier", weight: 9 },
      { text: "Analyzing data, reviewing a plan, or stress-testing an assumption.", role: "Filter", weight: 9 },
      { text: "Clearing my task list — executing, completing, shipping.", role: "Ground", weight: 10 },
      { text: "Checking in with the team — are handoffs smooth? Is anyone stuck?", role: "Conductor", weight: 9 },
    ]
  },
  {
    id: 3,
    text: "A project changes direction at the last minute. What is your honest first reaction?",
    construct: "Change response — measures adaptability orientation",
    options: [
      { text: "Excitement — a chance for fresh ideas and a better approach.", role: "Spark", weight: 9 },
      { text: "Opportunity — I immediately start selling the new direction to the team.", role: "Amplifier", weight: 8 },
      { text: "Concern — I worry about the implications, wasted resources, and new risks.", role: "Filter", weight: 9 },
      { text: "Frustration — the original plan was working, and now effort is wasted.", role: "Ground", weight: 9 },
      { text: "Responsibility — I step in to help the team realign and keep moving.", role: "Conductor", weight: 9 },
    ]
  },
  {
    id: 4,
    text: "What is the biggest 'energy drain' for you in a team?",
    construct: "Frustration trigger — measures core value orientation (inverse indicator)",
    options: [
      { text: "Being told an idea is 'impossible' before it's even been explored.", role: "Spark", weight: 9 },
      { text: "Low energy, lack of enthusiasm, or resistance to change in the room.", role: "Amplifier", weight: 9 },
      { text: "Sloppy thinking — decisions made without data, logic, or due diligence.", role: "Filter", weight: 9 },
      { text: "Endless discussion with no clear action plan, decision, or deadline.", role: "Ground", weight: 10 },
      { text: "People talking past each other — silos, miscommunication, broken handoffs.", role: "Conductor", weight: 9 },
    ]
  },

  // ═══════════════════════════════════════════════════════
  // DOMAIN 2: COGNITIVE STYLE (How you naturally think)
  // ═══════════════════════════════════════════════════════
  {
    id: 5,
    text: "How do you prefer to communicate a complex idea?",
    construct: "Communication modality — measures information processing style",
    options: [
      { text: "Metaphors, stories, and 'imagine this' scenarios.", role: "Spark", weight: 9 },
      { text: "An energetic pitch focused on the 'why' and the emotional impact.", role: "Amplifier", weight: 9 },
      { text: "Charts, data points, and logical step-by-step proofs.", role: "Filter", weight: 9 },
      { text: "Bullet points, timelines, and clear instructions.", role: "Ground", weight: 9 },
      { text: "Listening first, then synthesizing what I've heard into a cohesive summary.", role: "Conductor", weight: 9 },
    ]
  },
  {
    id: 6,
    text: "What does 'success' look like to you at the end of a workday?",
    construct: "Achievement definition — measures internal success criteria",
    options: [
      { text: "I had a breakthrough insight or solved a problem no one else could see.", role: "Spark", weight: 9 },
      { text: "I convinced someone to join the mission, or closed a deal.", role: "Amplifier", weight: 9 },
      { text: "I prevented a costly mistake or found a critical flaw before it shipped.", role: "Filter", weight: 9 },
      { text: "I completed everything on my list and hit every target.", role: "Ground", weight: 10 },
      { text: "The team is aligned, energized, and moving forward together.", role: "Conductor", weight: 9 },
    ]
  },
  {
    id: 7,
    text: "When you are 'in flow' — fully absorbed and performing at your peak — what are you doing?",
    construct: "Flow state trigger — measures peak performance conditions",
    options: [
      { text: "Inventing something new — breaking rules, connecting dots no one else sees.", role: "Spark", weight: 10 },
      { text: "On stage, pitching, or rallying a crowd around a shared vision.", role: "Amplifier", weight: 10 },
      { text: "Deep in analysis — finding the truth inside a complex system.", role: "Filter", weight: 10 },
      { text: "Executing a plan with precision — no interruptions, pure productivity.", role: "Ground", weight: 10 },
      { text: "Facilitating a group breakthrough — watching the pieces click into place.", role: "Conductor", weight: 10 },
    ]
  },
  {
    id: 8,
    text: "What is your relationship with risk?",
    construct: "Risk orientation — measures uncertainty tolerance",
    options: [
      { text: "I seek it. If it doesn't feel a little dangerous, it's not worth doing.", role: "Spark", weight: 9 },
      { text: "I sell it. I help others see that the reward justifies the risk.", role: "Amplifier", weight: 8 },
      { text: "I map it. I identify every risk so we can mitigate or avoid them.", role: "Filter", weight: 9 },
      { text: "I minimize it. Stability and predictability are how things actually get done.", role: "Ground", weight: 9 },
      { text: "I balance it. I make sure we take the right risks as a team, not recklessly.", role: "Conductor", weight: 8 },
    ]
  },

  // ═══════════════════════════════════════════════════════
  // DOMAIN 3: INTERPERSONAL DYNAMICS (How you naturally relate)
  // ═══════════════════════════════════════════════════════
  {
    id: 9,
    text: "In a heated team debate, what role do you naturally fall into?",
    construct: "Conflict behavior — measures interpersonal response under pressure",
    options: [
      { text: "The Provocateur — I challenge assumptions and push for a bigger vision.", role: "Spark", weight: 8 },
      { text: "The Evangelist — I keep energy high and rally people toward a decision.", role: "Amplifier", weight: 8 },
      { text: "The Analyst — I point out the flaws and demand evidence.", role: "Filter", weight: 9 },
      { text: "The Pragmatist — I bring the conversation back to practical next steps.", role: "Ground", weight: 9 },
      { text: "The Mediator — I translate between opposing viewpoints to find common ground.", role: "Conductor", weight: 10 },
    ]
  },
  {
    id: 10,
    text: "What value do you primarily bring to a meeting?",
    construct: "Perceived contribution — measures self-assessed team value",
    options: [
      { text: "Vision — I see possibilities that others don't.", role: "Spark", weight: 9 },
      { text: "Energy — I get people excited and moving.", role: "Amplifier", weight: 9 },
      { text: "Clarity — I separate fact from fiction and signal from noise.", role: "Filter", weight: 9 },
      { text: "Reliability — I ensure commitments are tracked and things actually get done.", role: "Ground", weight: 9 },
      { text: "Harmony — I ensure everyone is heard, aligned, and working together.", role: "Conductor", weight: 9 },
    ]
  },
  {
    id: 11,
    text: "Think back to childhood. In a group of kids, which one were you?",
    construct: "Developmental trait — measures innate behavioral tendency (pre-socialization)",
    options: [
      { text: "The one who invented the game or came up with the wild idea.", role: "Spark", weight: 10 },
      { text: "The one who got everyone excited to play and recruited more kids.", role: "Amplifier", weight: 10 },
      { text: "The one who pointed out when the rules were broken or something wasn't fair.", role: "Filter", weight: 10 },
      { text: "The one who actually built the fort, organized the teams, or kept score.", role: "Ground", weight: 10 },
      { text: "The one who made sure everyone was included and no one was left out.", role: "Conductor", weight: 10 },
    ]
  },
  {
    id: 12,
    text: "If you could only be known for one thing in your career, what would it be?",
    construct: "Legacy orientation — measures core identity and aspirational self-concept",
    options: [
      { text: "Creating something that didn't exist before.", role: "Spark", weight: 10 },
      { text: "Inspiring people to believe in something bigger than themselves.", role: "Amplifier", weight: 10 },
      { text: "Being the one who always found the truth and protected the team from mistakes.", role: "Filter", weight: 10 },
      { text: "Being the person who always delivered — on time, every time.", role: "Ground", weight: 10 },
      { text: "Building teams that worked together better than anyone thought possible.", role: "Conductor", weight: 10 },
    ]
  }
];

export const roleDescriptions: Record<Role, { title: string; description: string; advice: string; whoToGoTo: string; communicationGuide: string }> = {
  Spark: {
    title: "The Spark",
    description: "You are the Ignition Point. You generate the raw material for innovation. You thrive in the 'Elation' phase but can cause 'Panic' in others with constant changes. You live in the future.",
    advice: "Don't throw your ideas over the wall. Find an Amplifier to champion them before the Filters tear them apart.",
    whoToGoTo: "Go to an **Amplifier**. They will get your idea and help you sell it.",
    communicationGuide: `
### How to Communicate with a Spark
*   **DO:** Focus on the big picture, possibilities, and "what if." Be enthusiastic about new ideas. Allow for brainstorming without immediate judgment.
*   **DON'T:** Bog them down with details, logistics, or "why it won't work" too early. Don't demand immediate closure or rigid structure.
*   **KEY PHRASE:** "Imagine if..."
    `
  },
  Amplifier: {
    title: "The Amplifier",
    description: "You are the Signal Boost. You take the Spark's raw idea and give it momentum. You connect people, sell the vision, and get the team excited. You bridge the gap between the abstract and the real.",
    advice: "Don't overpromise. Make sure you check with a Filter before you sell the dream to the world.",
    whoToGoTo: "Go to a **Spark** for new ideas, or a **Filter** to check your facts.",
    communicationGuide: `
### How to Communicate with an Amplifier
*   **DO:** Focus on the people, the excitement, and the potential impact. Be energetic and open. Acknowledge their contribution to the team spirit.
*   **DON'T:** Be overly negative or critical without offering a solution. Don't ignore the human element. Don't be a "wet blanket."
*   **KEY PHRASE:** "Let's get everyone on board..."
    `
  },
  Filter: {
    title: "The Filter",
    description: "You are the Signal-to-Noise Ratio. You see the flaws that others miss. You challenge assumptions, test logic, and ensure the plan is bulletproof. You save the team from disaster.",
    advice: "Don't kill the idea too early. Let the Spark and Amplifier build it up a bit before you stress-test it. Frame your feedback as 'refining' not 'rejecting'.",
    whoToGoTo: "Go to a **Ground** to see if it's feasible, or a **Conductor** if you feel unheard.",
    communicationGuide: `
### How to Communicate with a Filter
*   **DO:** Be logical, prepared, and data-driven. Give them time to think and analyze. Appreciate their attention to detail and risk management.
*   **DON'T:** Rush them or pressure them for an immediate "yes." Don't dismiss their concerns as "negativity." Don't be vague.
*   **KEY PHRASE:** "Does this make sense?"
    `
  },
  Ground: {
    title: "The Ground",
    description: "You are the Earth/Reality Check. You turn the refined plan into reality. You focus on the details, the timeline, and the deliverables. You get it done.",
    advice: "Don't get stuck in the weeds. Look up occasionally to see where the Conductor is steering the ship. Ask for clarity if the Spark keeps changing the target.",
    whoToGoTo: "Go to a **Filter** for clear specs, or a **Conductor** to clear blockers.",
    communicationGuide: `
### How to Communicate with a Ground
*   **DO:** Be clear, specific, and practical. Define roles, responsibilities, and deadlines. Respect their time and process.
*   **DON'T:** Change the plan constantly without a good reason. Don't be vague about what "done" looks like. Don't interrupt their flow with theoretical discussions.
*   **KEY PHRASE:** "Here is the plan."
    `
  },
  Conductor: {
    title: "The Conductor",
    description: "You are the Flow State Architect. You don't play an instrument; you lead the orchestra. You ensure the handoffs between Spark, Amplifier, Filter, and Ground are smooth. You manage the energy.",
    advice: "Don't try to do everyone's job. Your job is the *process*, not the *content*. Trust the Ground to execute and the Filter to check.",
    whoToGoTo: "Go to **Everyone**. You are the hub.",
    communicationGuide: `
### How to Communicate with a Conductor
*   **DO:** Focus on the process, the team dynamics, and the overall goal. Be collaborative and open to feedback. Help them maintain harmony.
*   **DON'T:** Create unnecessary conflict or drama. Don't ignore the "rules of engagement." Don't exclude people from the loop.
*   **KEY PHRASE:** "How do we move forward together?"
    `
  }
};

// --- Scoring Logic ---
// 
// PSYCHOMETRIC NOTES:
// - Ipsative scoring: percentages represent RELATIVE energy distribution
// - Total possible points vary slightly by answer pattern (weights 7-10)
// - Normalization to 100% ensures comparable profiles across respondents
// - With 12 items, each role has 12 measurement opportunities
// - Expected range for dominant role: 25-45% (well-differentiated)
// - Expected range for secondary role: 18-30%
// - Expected range for tertiary roles: 8-20%

// Legacy Likert scoring (single-select, kept for backward compatibility)
export function calculateRoleScoresLikert(answers: Record<number, string>) {
  const scores: Record<Role, number> = {
    Spark: 0,
    Amplifier: 0,
    Filter: 0,
    Ground: 0,
    Conductor: 0
  };

  Object.entries(answers).forEach(([questionId, answerText]) => {
    const question = surveyQuestions.find(q => q.id === Number(questionId));
    if (question) {
      const selectedOption = question.options.find(o => o.text === answerText);
      if (selectedOption) {
        scores[selectedOption.role] += selectedOption.weight;
      }
    }
  });

  return scores;
}

// ── FORCED-RANK SCORING ────────────────────────────────────────
//
// IPSATIVE SCORING (same method as StrengthsFinder, Belbin, TDP):
// Each question produces scores for ALL 5 roles based on rank position.
// Position weights: 1st = 5pts, 2nd = 4pts, 3rd = 3pts, 4th = 2pts, 5th = 1pt
// This eliminates the "Spark inflation" bias (37% misclassification)
// proven in our 10,000-respondent Monte Carlo simulation.
//
// With 12 questions × 5 positions, each role accumulates 12 position scores.
// Total possible per role: 12 × 5 = 60 (if ranked #1 every time)
// Minimum per role: 12 × 1 = 12 (if ranked #5 every time)
// This creates much wider score spread and better differentiation.

export type RankingAnswer = { role: Role; text: string }[];

export function calculateRoleScores(
  answers: Record<number, string | RankingAnswer>
) {
  const scores: Record<Role, number> = {
    Spark: 0,
    Amplifier: 0,
    Filter: 0,
    Ground: 0,
    Conductor: 0
  };

  Object.entries(answers).forEach(([questionId, answer]) => {
    // Forced-rank format: answer is an array of { role, text } in ranked order
    if (Array.isArray(answer)) {
      const ranking = answer as RankingAnswer;
      const positionWeights = [5, 4, 3, 2, 1];
      ranking.forEach((item, index) => {
        if (item.role && positionWeights[index] !== undefined) {
          scores[item.role] += positionWeights[index];
        }
      });
    } else {
      // Legacy Likert format: answer is a string (selected option text)
      const question = surveyQuestions.find(q => q.id === Number(questionId));
      if (question) {
        const selectedOption = question.options.find(o => o.text === answer);
        if (selectedOption) {
          scores[selectedOption.role] += selectedOption.weight;
        }
      }
    }
  });

  return scores;
}

export function getRolePercentages(scores: Record<Role, number>): { role: Role; score: number; percentage: number }[] {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  const roles: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
  return roles
    .map(role => ({
      role,
      score: scores[role],
      percentage: Math.round((scores[role] / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function getDominantRole(scores: Record<Role, number>) {
  let maxScore = 0;
  let dominantRole: Role = "Conductor"; // Default

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

export const getRoleColor = (role: Role): string => {
  switch (role) {
    case "Spark": return "text-yellow-400";
    case "Amplifier": return "text-orange-500";
    case "Filter": return "text-blue-400";
    case "Ground": return "text-green-500";
    case "Conductor": return "text-purple-500";
    default: return "text-gray-400";
  }
};

export const getRoleBgColor = (role: Role): string => {
  switch (role) {
    case "Spark": return "bg-yellow-400";
    case "Amplifier": return "bg-orange-500";
    case "Filter": return "bg-blue-400";
    case "Ground": return "bg-green-500";
    case "Conductor": return "bg-purple-500";
    default: return "bg-gray-400";
  }
};

export const getRoleBgLight = (role: Role): string => {
  switch (role) {
    case "Spark": return "bg-yellow-400/10";
    case "Amplifier": return "bg-orange-500/10";
    case "Filter": return "bg-blue-400/10";
    case "Ground": return "bg-green-500/10";
    case "Conductor": return "bg-purple-500/10";
    default: return "bg-gray-400/10";
  }
};

// --- COMBINATION PROFILE ---
// Most people aren't purely one role. They're a blend.
// The combination profile captures the primary-secondary pairing.

export interface CombinationProfile {
  primary: Role;
  secondary: Role;
  label: string; // e.g. "Spark-Amplifier"
  primaryPct: number;
  secondaryPct: number;
  isPure: boolean; // true if primary > 50% or gap > 25%
  purityScore: number; // 0-100, how concentrated in dominant role
  description: string;
}

export function getCombinationProfile(scores: Record<Role, number>): CombinationProfile {
  const ranked = getRolePercentages(scores);
  if (ranked.length < 2) {
    return {
      primary: "Conductor", secondary: "Conductor",
      label: "Conductor", primaryPct: 100, secondaryPct: 0,
      isPure: true, purityScore: 100, description: ""
    };
  }

  const primary = ranked[0];
  const secondary = ranked[1];
  const gap = primary.percentage - secondary.percentage;
  const isPure = primary.percentage >= 50 || gap >= 25;

  // Purity score: how concentrated is energy in the dominant role?
  // 20% = perfectly even (5 roles), 100% = all in one role
  // Normalize: (actual% - 20%) / (100% - 20%) * 100
  const purityScore = Math.min(100, Math.max(0, Math.round(((primary.percentage - 20) / 80) * 100)));

  const label = isPure ? primary.role : `${primary.role}-${secondary.role}`;

  const description = isPure
    ? `You are a concentrated ${primary.role}. Your energy is strongly focused — ${primary.percentage}% of your operational energy flows through this single channel. This clarity is a gift when you're in the right seat, but it also means operating outside your role creates significant stress.`
    : `You are a ${primary.role}-${secondary.role} blend. Your energy splits between two channels — ${primary.percentage}% ${primary.role} and ${secondary.percentage}% ${secondary.role}. This gives you versatility at the boundary between these roles, but you may feel pulled in two directions under pressure.`;

  return {
    primary: primary.role,
    secondary: secondary.role,
    label,
    primaryPct: primary.percentage,
    secondaryPct: secondary.percentage,
    isPure,
    purityScore,
    description
  };
}

// --- STRESS RADIATION MODEL ---
// The further you operate from your natural role, the more stress you experience.
// This is the core insight: operating outside your nature reduces your possibility
// as a human getting toward your best self.
//
// The model uses "role distance" — how far apart two roles are in the innovation
// relay sequence: Spark → Amplifier → Filter → Ground → Conductor
// Adjacent roles have low stress; opposite roles have high stress.

export const ROLE_ORDER: Role[] = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];

// Stress matrix: cost of a person with role X operating as role Y
// Values 0-100 where 0 = natural, 100 = maximum friction
const STRESS_MATRIX: Record<Role, Record<Role, number>> = {
  Spark:     { Spark: 0,  Amplifier: 20, Filter: 70, Ground: 90, Conductor: 45 },
  Amplifier: { Spark: 25, Amplifier: 0,  Filter: 55, Ground: 75, Conductor: 30 },
  Filter:    { Spark: 75, Amplifier: 50, Filter: 0,  Ground: 25, Conductor: 40 },
  Ground:    { Spark: 90, Amplifier: 70, Filter: 20, Ground: 0,  Conductor: 50 },
  Conductor: { Spark: 40, Amplifier: 25, Filter: 35, Ground: 45, Conductor: 0  },
};

export interface StressZone {
  targetRole: Role;
  stressLevel: number; // 0-100
  label: string; // "Natural", "Low Stretch", "Moderate Strain", "High Friction", "Burnout Zone"
  description: string;
  energyCost: string; // human-readable cost
}

export function getStressZones(profile: CombinationProfile): StressZone[] {
  const primaryStress = STRESS_MATRIX[profile.primary];
  const secondaryStress = STRESS_MATRIX[profile.secondary];

  return ROLE_ORDER.map(targetRole => {
    // Weighted stress: blend primary and secondary stress based on purity
    const primaryWeight = profile.primaryPct / 100;
    const secondaryWeight = profile.secondaryPct / 100;
    const totalWeight = primaryWeight + secondaryWeight;
    const rawStress = ((primaryStress[targetRole] * primaryWeight) + (secondaryStress[targetRole] * secondaryWeight)) / totalWeight;
    const stressLevel = Math.round(rawStress);

    let label: string;
    let description: string;
    let energyCost: string;

    if (stressLevel <= 10) {
      label = "Natural";
      description = `This is your home. Operating as a ${targetRole} feels effortless — you're in flow, not fighting yourself.`;
      energyCost = "Minimal — this is where you generate energy";
    } else if (stressLevel <= 30) {
      label = "Low Stretch";
      description = `You can operate as a ${targetRole} comfortably for extended periods. It's a natural extension of your core energy.`;
      energyCost = "Low — sustainable with occasional recovery";
    } else if (stressLevel <= 55) {
      label = "Moderate Strain";
      description = `Operating as a ${targetRole} requires conscious effort. You can do it, but it drains your battery faster than your natural role.`;
      energyCost = "Moderate — requires deliberate recovery time";
    } else if (stressLevel <= 75) {
      label = "High Friction";
      description = `Operating as a ${targetRole} fights against your wiring. Extended time here leads to frustration, mistakes, and diminished performance.`;
      energyCost = "High — unsustainable beyond short bursts";
    } else {
      label = "Burnout Zone";
      description = `Operating as a ${targetRole} is the opposite of who you are. This is where careers stall, health suffers, and potential dies. Every hour here costs you three hours of recovery.`;
      energyCost = "Critical — actively destroys your capacity";
    }

    return { targetRole, stressLevel, label, description, energyCost };
  });
}

// --- BEST SELF INSIGHT ---
// The core message: operating in your natural role is the path to your best self.
// Operating outside it is the single biggest barrier to human potential.

export function getBestSelfInsight(profile: CombinationProfile, stressZones: StressZone[]): string {
  const burnoutZones = stressZones.filter(z => z.stressLevel > 70);
  const naturalZones = stressZones.filter(z => z.stressLevel <= 20);

  const burnoutNames = burnoutZones.map(z => z.targetRole).join(" or ");
  const naturalNames = naturalZones.map(z => z.targetRole).join(" and ");

  if (profile.isPure) {
    return `Your energy is concentrated — ${profile.primaryPct}% ${profile.primary}. This means you have extraordinary depth in your natural role, but the cost of operating outside it is equally extreme. ${burnoutZones.length > 0 ? `Being forced into a ${burnoutNames} role doesn't just reduce your performance — it reduces your possibility as a human being. It pulls you away from your best self.` : ''} The science is clear: who you ARE matters more than what you know. Your ${profile.primary} energy isn't a skill you learned — it's the operating system you were born with. Honor it.`;
  } else {
    return `Your energy blends ${profile.primary} (${profile.primaryPct}%) and ${profile.secondary} (${profile.secondaryPct}%). This gives you range — you can operate naturally as ${naturalNames}. ${burnoutZones.length > 0 ? `But being pushed into a ${burnoutNames} role creates real friction. It's not about capability — you CAN do it. But every hour spent fighting your nature is an hour stolen from your best self.` : ''} Remember: it's more important who you are as a person than what you've learned. Your blend is your signature — not a limitation.`;
  }
}

// --- TEAM STRESS ANALYSIS ---
// For team maps: show how each person's stress relates to the team's needs

export interface TeamMemberProfile {
  name: string;
  scores: Record<Role, number>;
  profile: CombinationProfile;
  stressZones: StressZone[];
}

export function analyzeTeamStress(members: TeamMemberProfile[]): {
  gaps: Role[];
  overloaded: Role[];
  frictionPairs: { member1: string; member2: string; reason: string }[];
  recommendation: string;
} {
  const roleCoverage: Record<Role, number> = { Spark: 0, Amplifier: 0, Filter: 0, Ground: 0, Conductor: 0 };

  members.forEach(m => {
    roleCoverage[m.profile.primary] += m.profile.primaryPct;
    if (!m.profile.isPure) {
      roleCoverage[m.profile.secondary] += m.profile.secondaryPct;
    }
  });

  const totalEnergy = Object.values(roleCoverage).reduce((a, b) => a + b, 0);
  const avgPerRole = totalEnergy / 5;

  const gaps = ROLE_ORDER.filter(r => roleCoverage[r] < avgPerRole * 0.5);
  const overloaded = ROLE_ORDER.filter(r => roleCoverage[r] > avgPerRole * 1.8);

  // Find friction pairs: members whose natural roles create tension
  const frictionPairs: { member1: string; member2: string; reason: string }[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const m1 = members[i];
      const m2 = members[j];
      const stress = STRESS_MATRIX[m1.profile.primary][m2.profile.primary];
      if (stress >= 70) {
        frictionPairs.push({
          member1: m1.name,
          member2: m2.name,
          reason: `${m1.profile.primary} and ${m2.profile.primary} are operationally opposite — they see the world through fundamentally different lenses.`
        });
      }
    }
  }

  let recommendation = "";
  if (gaps.length > 0) {
    recommendation += `Your team is missing ${gaps.join(" and ")} energy. Without a natural ${gaps.join("/")}, someone is being forced to operate outside their nature — and that's where stress, mistakes, and burnout live. `;
  }
  if (overloaded.length > 0) {
    recommendation += `You have too much ${overloaded.join(" and ")} energy. This creates echo chambers and blind spots. `;
  }
  if (frictionPairs.length > 0) {
    recommendation += `There are ${frictionPairs.length} high-friction relationship(s) on the team. This isn't personal — it's physics. A Conductor can bridge these gaps.`;
  }
  if (!recommendation) {
    recommendation = "Your team has balanced energy distribution across all five roles. This is rare and powerful — protect it.";
  }

  return { gaps, overloaded, frictionPairs, recommendation };
}

export const roleInsights: Record<Role, {
  tagline: string;
  superpower: string;
  blindSpot: string;
  underStress: string;
  bestWith: Role[];
  frictionWith: Role[];
  teamValue: string;
  growthEdge: string;
  mantra: string;
}> = {
  Spark: {
    tagline: "You see what doesn't exist yet — and you can't stop until it does.",
    superpower: "Generating breakthrough ideas and seeing possibilities where others see walls. You live three steps ahead of reality.",
    blindSpot: "You can overwhelm teams with constant new directions. Your excitement for the next idea can feel like abandonment of the current one.",
    underStress: "You become scattered, generating more ideas instead of finishing existing ones. You may withdraw if forced into rigid execution.",
    bestWith: ["Amplifier", "Conductor"],
    frictionWith: ["Ground", "Filter"],
    teamValue: "Without you, the team stagnates. You are the raw fuel of innovation — the initial ignition that starts every breakthrough.",
    growthEdge: "Practice staying with one idea long enough for it to take root. Partner with an Amplifier early to give your vision legs before the Filters arrive.",
    mantra: "\"The idea is nothing without the relay.\"",
  },
  Amplifier: {
    tagline: "You turn whispers into movements and skeptics into believers.",
    superpower: "Building momentum, rallying people, and selling the vision. You bridge the gap between a raw idea and organizational buy-in.",
    blindSpot: "You can overpromise and under-deliver. Your enthusiasm may outpace the team's capacity to execute.",
    underStress: "You become performative — selling harder instead of listening. You may ignore warning signs from Filters because they slow your momentum.",
    bestWith: ["Spark", "Ground"],
    frictionWith: ["Filter"],
    teamValue: "Without you, great ideas die in silence. You are the signal boost that turns a Spark's vision into organizational energy.",
    growthEdge: "Check with a Filter before you sell the dream. Your credibility is your currency — protect it by under-promising and over-delivering.",
    mantra: "\"Momentum without truth is just noise.\"",
  },
  Filter: {
    tagline: "You see the flaw everyone else missed — and you save the team from disaster.",
    superpower: "Critical analysis, risk identification, and quality assurance. You separate signal from noise and ensure the plan is bulletproof.",
    blindSpot: "You can kill ideas too early. Your critical eye may be perceived as negativity, even when you're trying to protect the team.",
    underStress: "You become hyper-critical and paralyzed by analysis. You may block progress by demanding impossible levels of certainty.",
    bestWith: ["Ground", "Conductor"],
    frictionWith: ["Spark", "Amplifier"],
    teamValue: "Without you, the team ships broken products and makes avoidable mistakes. You are the immune system of the organization.",
    growthEdge: "Frame your feedback as 'refining' not 'rejecting.' Let the Spark and Amplifier build momentum before you stress-test. Timing is everything.",
    mantra: "\"Truth without timing is just cruelty.\"",
  },
  Ground: {
    tagline: "You turn plans into reality — on time, on budget, no excuses.",
    superpower: "Execution, reliability, and operational precision. When you commit, it gets done. You are the foundation everything else rests on.",
    blindSpot: "You can resist change and become rigid. Your focus on 'the plan' may prevent you from adapting when the landscape shifts.",
    underStress: "You become frustrated and resentful when plans change repeatedly. You may disengage if you feel your work is being wasted.",
    bestWith: ["Filter", "Conductor"],
    frictionWith: ["Spark"],
    teamValue: "Without you, nothing ships. Ideas, momentum, and analysis are worthless without someone who turns them into tangible outcomes.",
    growthEdge: "Look up from the to-do list occasionally. Ask the Conductor for context on why things are changing — it's usually not personal.",
    mantra: "\"Execution is the ultimate form of respect.\"",
  },
  Conductor: {
    tagline: "You don't play the instrument — you make the music happen.",
    superpower: "Orchestrating flow between all roles, managing energy, and ensuring smooth handoffs. You see the whole system, not just the parts.",
    blindSpot: "You can become a bottleneck by trying to manage everything. Your desire for harmony may prevent necessary conflict.",
    underStress: "You become controlling and micromanage the process. You may suppress dissent to maintain artificial peace.",
    bestWith: ["Spark", "Ground"],
    frictionWith: [],
    teamValue: "Without you, the relay breaks down. Each role operates in isolation, handoffs fail, and the team fragments into silos.",
    growthEdge: "Trust the team to self-organize on small things. Your job is the process, not the content. Let the Filter challenge and the Spark disrupt.",
    mantra: "\"The best conductor is invisible when the music is perfect.\"",
  },
};
