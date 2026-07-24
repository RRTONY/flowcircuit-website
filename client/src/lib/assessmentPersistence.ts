/**
 * Assessment Persistence Layer
 * 
 * Provides user-keyed localStorage persistence for:
 * - Assessment history (all past results)
 * - Completion flag (skip form on return)
 * - Team data (persists across sessions)
 */

const HISTORY_KEY = "fc_assessment_history";
const COMPLETION_KEY = "fc_assessment_completed";
const TEAM_DATA_KEY = "fc_team_data";

export interface PersistedAssessment {
  assessmentId: number | string;
  email: string;
  name: string;
  role: string;
  scores: Record<string, number>;
  domain?: string;
  teamCode?: string;
  teamId?: string;
  shareToken?: string;
  completedAt: string; // ISO timestamp
}

export interface PersistedTeam {
  code: string;
  name: string;
  companyName?: string;
  createdAt: string;
}

// ─── Assessment History ───────────────────────────────────────────

/**
 * Get all past assessments for a given email (user ID key)
 */
export function getAssessmentHistory(email?: string): PersistedAssessment[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const all: PersistedAssessment[] = JSON.parse(raw);
    if (email) {
      return all.filter(a => a.email.toLowerCase() === email.toLowerCase());
    }
    return all;
  } catch {
    return [];
  }
}

/**
 * Save a completed assessment to persistent history
 */
export function saveAssessmentToHistory(assessment: PersistedAssessment): void {
  try {
    const history = getAssessmentHistory();
    // Avoid duplicates by assessmentId
    const existing = history.findIndex(a => a.assessmentId === assessment.assessmentId);
    if (existing >= 0) {
      history[existing] = assessment;
    } else {
      history.push(assessment);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Silent fail — localStorage might be full
  }
}

/**
 * Get the most recent assessment for a given email
 */
export function getLatestAssessment(email?: string): PersistedAssessment | null {
  const history = getAssessmentHistory(email);
  if (history.length === 0) return null;
  return history.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
}

// ─── Completion Flag ──────────────────────────────────────────────

/**
 * Mark that a user (by email) has completed an assessment.
 * Stores the assessmentId so we can route them to results.
 */
export function markAssessmentCompleted(email: string, assessmentId: number | string): void {
  try {
    const completions = getCompletions();
    completions[email.toLowerCase()] = {
      assessmentId,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
  } catch {
    // Silent fail
  }
}

/**
 * Check if a user has already completed an assessment
 */
export function hasCompletedAssessment(email?: string): { completed: boolean; assessmentId?: number | string } {
  // First check the completions map
  const completions = getCompletions();
  
  if (email) {
    const entry = completions[email.toLowerCase()];
    if (entry) {
      return { completed: true, assessmentId: entry.assessmentId };
    }
  }
  
  // Check generic completion (for non-logged-in users)
  const genericEntry = completions["__generic__"];
  if (genericEntry) {
    return { completed: true, assessmentId: genericEntry.assessmentId };
  }
  
  // Fallback: check legacy localStorage keys
  const genericId = localStorage.getItem("assessment_id");
  const genericRole = localStorage.getItem("assessment_dominant_role");
  if (genericId && genericRole) {
    return { completed: true, assessmentId: genericId };
  }
  
  return { completed: false };
}

function getCompletions(): Record<string, { assessmentId: number | string; completedAt: string }> {
  try {
    const raw = localStorage.getItem(COMPLETION_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ─── Team Data Persistence ────────────────────────────────────────

/**
 * Save team data to localStorage so it persists across sessions
 */
export function saveTeamData(team: PersistedTeam): void {
  try {
    const teams = getPersistedTeams();
    const existing = teams.findIndex(t => t.code === team.code);
    if (existing >= 0) {
      teams[existing] = team;
    } else {
      teams.push(team);
    }
    localStorage.setItem(TEAM_DATA_KEY, JSON.stringify(teams));
  } catch {
    // Silent fail
  }
}

/**
 * Get all persisted teams
 */
export function getPersistedTeams(): PersistedTeam[] {
  try {
    const raw = localStorage.getItem(TEAM_DATA_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Get the most recently created team
 */
export function getLatestTeam(): PersistedTeam | null {
  const teams = getPersistedTeams();
  if (teams.length === 0) return null;
  return teams.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

/**
 * Clear all persisted data (used on explicit logout)
 */
export function clearAllPersistedData(): void {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(COMPLETION_KEY);
  localStorage.removeItem(TEAM_DATA_KEY);
  localStorage.removeItem("assessment_results");
  localStorage.removeItem("assessment_guest_name");
  localStorage.removeItem("assessment_dominant_role");
  localStorage.removeItem("assessment_role_scores");
  localStorage.removeItem("assessment_name");
  localStorage.removeItem("assessment_id");
  localStorage.removeItem("assessment_share_token");
  localStorage.removeItem("assessment_domain");
  localStorage.removeItem("assessment_team_code");
  localStorage.removeItem("assessment_team_id");
  localStorage.removeItem("manus-runtime-user-info");
}
