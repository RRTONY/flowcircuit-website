import "server-only";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, teams, assessments, feedback, emailVerifications, peerReviews, emailDrips, soulprintOrders, calibrations, soulprintProfiles, teamAffiliations, InsertTeam, InsertAssessment, InsertFeedback, InsertEmailVerification, InsertPeerReview, InsertEmailDrip, InsertSoulprintOrder, SoulprintOrder, Team, Assessment, Feedback, EmailVerification, PeerReview, EmailDrip, InsertCalibration, Calibration, InsertSoulprintProfile, SoulprintProfile, TeamAffiliation, InsertTeamAffiliation, flow360Sessions, flow360Responses, InsertFlow360Session, Flow360Session, InsertFlow360Response, Flow360Response, tribeTrials, InsertTribeTrial, TribeTrial, passwordResets } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";
import { randomBytes } from "crypto";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  return result[0] ?? undefined;
}

export async function createUserWithPassword(data: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) return null;
  const email = data.email.toLowerCase().trim();
  const role = email === ENV.ownerOpenId.toLowerCase() ? "admin" : "user";
  const [user] = await db.insert(users).values({
    openId: email,
    email,
    name: data.name,
    passwordHash: data.passwordHash,
    loginMethod: "credentials",
    role,
    lastSignedIn: new Date(),
  }).returning();
  return user ?? null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

// ─── Password Reset Helpers ─────────────────────────────────────────

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  await db.insert(passwordResets).values({ userId, token, expiresAt });
  return token;
}

export async function consumePasswordResetToken(token: string, newPasswordHash: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [reset] = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1);
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) return false;

  await db.update(users).set({ passwordHash: newPasswordHash, updatedAt: new Date() }).where(eq(users.id, reset.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, reset.id));
  return true;
}

// ─── Team Helpers ────────────────────────────────────────────────

export async function createTeam(ownerId: number, name: string, companyName?: string): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;

  const code = nanoid(8);
  const [team] = await db.insert(teams).values({ code, name, ownerId, companyName: companyName ?? null }).returning();
  return team ?? null;
}

export async function getTeamByCode(code: string): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teams).where(eq(teams.code, code)).limit(1);
  return result[0] ?? null;
}

export async function getTeamById(id: number): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getTeamsByOwner(ownerId: number): Promise<Team[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.ownerId, ownerId)).orderBy(desc(teams.createdAt));
}

export async function updateTeamSettings(teamId: number, settings: {
  name?: string;
  companyName?: string | null;
  logoUrl?: string | null;
  slackWebhookUrl?: string | null;
  weeklyReportEnabled?: boolean;
  weeklyReportEmail?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {};
  if (settings.name !== undefined) updateSet.name = settings.name;
  if (settings.companyName !== undefined) updateSet.companyName = settings.companyName;
  if (settings.logoUrl !== undefined) updateSet.logoUrl = settings.logoUrl;
  if (settings.slackWebhookUrl !== undefined) updateSet.slackWebhookUrl = settings.slackWebhookUrl;
  if (settings.weeklyReportEnabled !== undefined) updateSet.weeklyReportEnabled = settings.weeklyReportEnabled;
  if (settings.weeklyReportEmail !== undefined) updateSet.weeklyReportEmail = settings.weeklyReportEmail;
  if (Object.keys(updateSet).length > 0) {
    updateSet.updatedAt = new Date();
    await db.update(teams).set(updateSet).where(eq(teams.id, teamId));
  }
}

// ─── Domain-Based Team Helpers ──────────────────────────────────

export async function getTeamByDomain(domain: string): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;
  const normalized = domain.toLowerCase().trim();
  const result = await db.select().from(teams).where(eq(teams.domain, normalized)).limit(1);
  return result[0] ?? null;
}

export async function getOrCreateTeamByDomain(domain: string): Promise<Team | null> {
  const db = await getDb();
  if (!db) return null;
  const normalized = domain.toLowerCase().trim();

  return db.transaction(async (tx) => {
    const existing = await tx.select().from(teams).where(eq(teams.domain, normalized)).limit(1);
    if (existing[0]) return existing[0];

    // Auto-create a team for this domain
    const code = nanoid(8);
    const companyName = normalized.split('.')[0].charAt(0).toUpperCase() + normalized.split('.')[0].slice(1);
    // Use ownerId=0 for auto-created domain teams (no specific owner yet)
    const [created] = await tx.insert(teams).values({
      code,
      domain: normalized,
      name: `${companyName} Team`,
      companyName,
      ownerId: 0,
      isAlpha: true,
    }).returning();
    return created ?? null;
  });
}

export async function getAllAssessments(): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).orderBy(desc(assessments.createdAt));
}

export async function getDistinctDomains(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.selectDistinct({ domain: assessments.domain }).from(assessments).where(sql`${assessments.domain} IS NOT NULL AND ${assessments.domain} != ''`);
  return rows.map(r => r.domain).filter(Boolean) as string[];
}

export async function getAssessmentsByDomain(domain: string): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) return [];
  const normalized = domain.toLowerCase().trim();
  return db.select().from(assessments).where(eq(assessments.domain, normalized)).orderBy(desc(assessments.createdAt));
}

// ─── Assessment Helpers ──────────────────────────────────────────

export async function saveAssessment(data: InsertAssessment): Promise<Assessment | null> {
  const db = await getDb();
  if (!db) return null;
  const [assessment] = await db.insert(assessments).values(data).returning();
  return assessment ?? null;
}

export async function getAssessmentsByTeam(teamId: number): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.teamId, teamId)).orderBy(desc(assessments.createdAt));
}

export async function getAssessmentsByUser(userId: number): Promise<Assessment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.userId, userId)).orderBy(desc(assessments.createdAt));
}

export async function getAssessmentByShareToken(token: string): Promise<Assessment | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessments).where(eq(assessments.shareToken, token)).limit(1);
  return result[0] ?? null;
}

export async function getAssessmentByEmail(email: string): Promise<Assessment | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessments).where(eq(assessments.guestEmail, email.toLowerCase().trim())).orderBy(desc(assessments.createdAt)).limit(1);
  return result[0] ?? null;
}

export async function getAssessmentById(id: number): Promise<Assessment | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return result[0] ?? null;
}

// ─── Feedback Helpers ───────────────────────────────────────────

export async function saveFeedback(data: InsertFeedback): Promise<Feedback | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.insert(feedback).values(data).returning();
  return row ?? null;
}

export async function getFeedbackByTeam(teamId: number): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback).where(eq(feedback.teamId, teamId)).orderBy(desc(feedback.createdAt));
}
// ─── Testimonial Helpers ─────────────────────────────────────────

export async function submitTestimonial(data: {
  authorName: string;
  authorEmail?: string | null;
  testimonialQuote: string;
  authorTitle?: string | null;
  authorCompany?: string | null;
  flowCircuitRole?: string | null;
  assessmentId?: number | null;
}): Promise<Feedback | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.insert(feedback).values({
    authorName: data.authorName,
    authorEmail: data.authorEmail ?? null,
    testimonialQuote: data.testimonialQuote,
    authorTitle: data.authorTitle ?? null,
    authorCompany: data.authorCompany ?? null,
    flowCircuitRole: data.flowCircuitRole ?? null,
    assessmentId: data.assessmentId ?? null,
    isTestimonial: true,
    testimonialApproved: false,
  }).returning();
  return row ?? null;
}

export async function getApprovedTestimonials(): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback)
    .where(and(eq(feedback.isTestimonial, true), eq(feedback.testimonialApproved, true)))
    .orderBy(desc(feedback.createdAt));
}

export async function getPendingTestimonials(): Promise<Feedback[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedback)
    .where(and(eq(feedback.isTestimonial, true), eq(feedback.testimonialApproved, false)))
    .orderBy(desc(feedback.createdAt));
}

export async function approveTestimonial(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(feedback).set({ testimonialApproved: true }).where(eq(feedback.id, id));
}
// ─── Email Verification Helpers ─────────────────────────────────────

export async function createEmailVerification(email: string, assessmentId: number): Promise<EmailVerification | null> {
  const db = await getDb();
  if (!db) return null;
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  const [row] = await db.insert(emailVerifications).values({
    email: email.toLowerCase().trim(),
    code,
    assessmentId,
    verified: false,
    expiresAt,
  }).returning();
  return row ?? null;
}

export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const normalized = email.toLowerCase().trim();
  const result = await db.select().from(emailVerifications)
    .where(and(
      eq(emailVerifications.email, normalized),
      eq(emailVerifications.code, code),
      eq(emailVerifications.verified, false)
    ))
    .limit(1);
  if (!result[0]) return false;
  // Check expiry
  if (result[0].expiresAt < new Date()) return false;
  // Mark as verified
  await db.update(emailVerifications)
    .set({ verified: true })
    .where(eq(emailVerifications.id, result[0].id));
  return true;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const normalized = email.toLowerCase().trim();
  const result = await db.select().from(emailVerifications)
    .where(and(
      eq(emailVerifications.email, normalized),
      eq(emailVerifications.verified, true)
    ))
    .limit(1);
  return !!result[0];
}

// ─── Peer Review (360) Helpers ──────────────────────────────────

export async function createPeerReviewInvite(targetAssessmentId: number, targetName: string, reviewerEmail: string): Promise<PeerReview | null> {
  const db = await getDb();
  if (!db) return null;
  const inviteToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const [row] = await db.insert(peerReviews).values({
    targetAssessmentId,
    targetName,
    reviewerName: "",
    reviewerEmail: reviewerEmail.toLowerCase().trim(),
    perceivedRole: "",
    inviteToken,
    completed: false,
  }).returning();
  return row ?? null;
}

export async function getPeerReviewByToken(token: string): Promise<PeerReview | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(peerReviews)
    .where(eq(peerReviews.inviteToken, token))
    .limit(1);
  return result[0] ?? null;
}

export async function completePeerReview(token: string, reviewerName: string, perceivedRole: string, perceivedScores: Record<string, number>, answers: Record<number, string>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  return db.transaction(async (tx) => {
    const [review] = await tx.select().from(peerReviews).where(eq(peerReviews.inviteToken, token)).limit(1);
    if (!review || review.completed) return false;
    await tx.update(peerReviews)
      .set({
        reviewerName,
        perceivedRole,
        perceivedScores,
        answers,
        completed: true,
        completedAt: new Date(),
      })
      .where(eq(peerReviews.inviteToken, token));
    return true;
  });
}

export async function getPeerReviewsByAssessment(assessmentId: number): Promise<PeerReview[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(peerReviews)
    .where(eq(peerReviews.targetAssessmentId, assessmentId))
    .orderBy(desc(peerReviews.createdAt));
}

// ─── Email Drip Helpers ─────────────────────────────────────────────────

export async function createEmailDrip(data: InsertEmailDrip): Promise<EmailDrip | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.insert(emailDrips).values(data).returning();
  return row ?? null;
}

export async function getPendingDrips(dripDay: 'day1' | 'day3' | 'day7'): Promise<EmailDrip[]> {
  const db = await getDb();
  if (!db) return [];
  const sentColumn = dripDay === 'day1' ? emailDrips.day1Sent
    : dripDay === 'day3' ? emailDrips.day3Sent
    : emailDrips.day7Sent;
  return db.select().from(emailDrips)
    .where(and(
      eq(sentColumn, false),
      eq(emailDrips.unsubscribed, false)
    ))
    .orderBy(desc(emailDrips.createdAt));
}

export async function markDripSent(id: number, dripDay: 'day1' | 'day3' | 'day7'): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const updateSet: Record<string, unknown> = {};
  if (dripDay === 'day1') { updateSet.day1Sent = true; updateSet.day1SentAt = new Date(); }
  if (dripDay === 'day3') { updateSet.day3Sent = true; updateSet.day3SentAt = new Date(); }
  if (dripDay === 'day7') { updateSet.day7Sent = true; updateSet.day7SentAt = new Date(); }
  await db.update(emailDrips).set(updateSet).where(eq(emailDrips.id, id));
}

export async function unsubscribeDrip(email: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(emailDrips)
    .set({ unsubscribed: true })
    .where(eq(emailDrips.email, email.toLowerCase().trim()));
}

// ─── Admin Analytics Helpers ──────────────────────────────────────────

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalAssessments] = await db.select({ count: count() }).from(assessments);
  const [totalTeams] = await db.select({ count: count() }).from(teams);
  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalFeedback] = await db.select({ count: count() }).from(feedback);
  const [totalPeerReviews] = await db.select({ count: count() }).from(peerReviews);
  const [totalDrips] = await db.select({ count: count() }).from(emailDrips);

  // Role distribution
  const roleDistribution = await db.select({
    role: assessments.role,
    count: count(),
  }).from(assessments).groupBy(assessments.role);

  // Domain activity (top 10 most active domains)
  const domainActivity = await db.select({
    domain: assessments.domain,
    count: count(),
  }).from(assessments)
    .where(sql`${assessments.domain} IS NOT NULL`)
    .groupBy(assessments.domain)
    .orderBy(desc(count()))
    .limit(10);

  // Recent assessments (last 20)
  const recentAssessments = await db.select({
    id: assessments.id,
    guestName: assessments.guestName,
    guestEmail: assessments.guestEmail,
    domain: assessments.domain,
    role: assessments.role,
    score: assessments.score,
    scores: assessments.scores,
    shareToken: assessments.shareToken,
    createdAt: assessments.createdAt,
  }).from(assessments)
    .orderBy(desc(assessments.createdAt))
    .limit(20);

  // Teams with member counts
  const teamStats = await db.select({
    id: teams.id,
    name: teams.name,
    domain: teams.domain,
    companyName: teams.companyName,
    isAlpha: teams.isAlpha,
    maxMembers: teams.maxMembers,
    createdAt: teams.createdAt,
  }).from(teams)
    .orderBy(desc(teams.createdAt))
    .limit(20);

  return {
    totals: {
      assessments: totalAssessments.count,
      teams: totalTeams.count,
      users: totalUsers.count,
      feedback: totalFeedback.count,
      peerReviews: totalPeerReviews.count,
      emailDrips: totalDrips.count,
    },
    roleDistribution,
    domainActivity,
    recentAssessments,
    teamStats,
  };
}

// ─── Slack Notification Helper ───────────────────────────────────────

export async function sendSlackNotification(webhookUrl: string, message: {
  text: string;
  blocks?: unknown[];
}): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return response.ok;
  } catch (error) {
    console.error("[Slack] Failed to send notification:", error);
    return false;
  }
}

// ─── Norming Data Helpers ──────────────────────────────────────────

export async function getNormingData() {
  const db = await getDb();
  if (!db) return null;

  // Get total count
  const [totalRow] = await db.select({ count: count() }).from(assessments);
  const total = totalRow.count;
  if (total === 0) return { total: 0, roleDistribution: {}, averageScores: {}, percentileData: [] };

  // Get role distribution
  const roleCounts = await db.select({
    role: assessments.role,
    count: count(),
  }).from(assessments).groupBy(assessments.role);

  const roleDistribution: Record<string, { count: number; percentage: number }> = {};
  for (const r of roleCounts) {
    roleDistribution[r.role] = {
      count: r.count,
      percentage: Math.round((r.count / total) * 100),
    };
  }

  // Get all scores for percentile calculation
  const allScores = await db.select({
    id: assessments.id,
    role: assessments.role,
    score: assessments.score,
    scores: assessments.scores,
  }).from(assessments)
    .orderBy(assessments.score);

  // Calculate average scores per role
  const roleScoreSums: Record<string, { total: number; count: number }> = {};
  for (const a of allScores) {
    if (!roleScoreSums[a.role]) roleScoreSums[a.role] = { total: 0, count: 0 };
    roleScoreSums[a.role].total += a.score;
    roleScoreSums[a.role].count += 1;
  }
  const averageScores: Record<string, number> = {};
  for (const [role, data] of Object.entries(roleScoreSums)) {
    averageScores[role] = Math.round(data.total / data.count);
  }

  return {
    total,
    roleDistribution,
    averageScores,
    percentileData: allScores.map(a => ({
      id: a.id,
      role: a.role,
      score: a.score,
      scores: a.scores,
    })),
  };
}

export async function getPercentileForScore(role: string, score: number): Promise<number> {
  const db = await getDb();
  if (!db) return 50;

  // Count how many assessments with the same role have a lower score
  const [belowRow] = await db.select({ count: count() }).from(assessments)
    .where(and(eq(assessments.role, role), sql`${assessments.score} < ${score}`));
  const [totalRow] = await db.select({ count: count() }).from(assessments)
    .where(eq(assessments.role, role));

  if (totalRow.count === 0) return 50;
  return Math.round((belowRow.count / totalRow.count) * 100);
}

// ─── Team Comparison Helpers ────────────────────────────────────────

export async function getTeamComparisonData(teamId1: number, teamId2: number) {
  const db = await getDb();
  if (!db) return null;

  const team1 = await getTeamById(teamId1);
  const team2 = await getTeamById(teamId2);
  if (!team1 || !team2) return null;

  const team1Assessments = await getAssessmentsByTeam(teamId1);
  const team2Assessments = await getAssessmentsByTeam(teamId2);

  const getRoleBreakdown = (assessmentList: Assessment[]) => {
    const roles: Record<string, number> = { Spark: 0, Amplifier: 0, Filter: 0, Ground: 0, Conductor: 0 };
    for (const a of assessmentList) {
      if (roles[a.role] !== undefined) roles[a.role]++;
    }
    const total = assessmentList.length || 1;
    return Object.entries(roles).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  };

  const getAverageScore = (assessmentList: Assessment[]) => {
    if (assessmentList.length === 0) return 0;
    return Math.round(assessmentList.reduce((sum, a) => sum + a.score, 0) / assessmentList.length);
  };

  const getMissingRoles = (assessmentList: Assessment[]) => {
    const presentRoles = new Set(assessmentList.map(a => a.role));
    return ['Spark', 'Amplifier', 'Filter', 'Ground', 'Conductor'].filter(r => !presentRoles.has(r));
  };

  return {
    team1: {
      ...team1,
      memberCount: team1Assessments.length,
      roleBreakdown: getRoleBreakdown(team1Assessments),
      averageScore: getAverageScore(team1Assessments),
      missingRoles: getMissingRoles(team1Assessments),
    },
    team2: {
      ...team2,
      memberCount: team2Assessments.length,
      roleBreakdown: getRoleBreakdown(team2Assessments),
      averageScore: getAverageScore(team2Assessments),
      missingRoles: getMissingRoles(team2Assessments),
    },
  };
}


// ─── SoulPrint Order Helpers ────────────────────────────────────────────────

export async function getSoulprintAlphaCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db
    .select({ count: count() })
    .from(soulprintOrders)
    .where(eq(soulprintOrders.isAlpha, true));
  return result?.count ?? 0;
}

export async function createSoulprintOrder(data: {
  userId: number | null;
  assessmentId: number | null;
  guestName: string | null;
  guestEmail: string | null;
  birthDate: string;
  birthTime: string | null;
  birthCity: string;
  tier: "blueprint" | "compass" | "oracle";
  reportType: "soulprint_only" | "combined";
  isAlpha: boolean;
  amountPaid: number;
}): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(soulprintOrders).values({
    userId: data.userId,
    assessmentId: data.assessmentId,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    birthCity: data.birthCity,
    tier: data.tier,
    reportType: data.reportType,
    isAlpha: data.isAlpha,
    amountPaid: data.amountPaid,
    soulprintStatus: "pending",
  }).returning({ id: soulprintOrders.id });
  if (!result?.id) return null;
  return { id: result.id };
}

export async function getSoulprintOrderById(orderId: number): Promise<SoulprintOrder | null> {
  const db = await getDb();
  if (!db) return null;
  const [order] = await db
    .select()
    .from(soulprintOrders)
    .where(eq(soulprintOrders.id, orderId))
    .limit(1);
  return order ?? null;
}

export async function getSoulprintOrderByAssessment(assessmentId: number): Promise<SoulprintOrder | null> {
  const db = await getDb();
  if (!db) return null;
  const [order] = await db
    .select()
    .from(soulprintOrders)
    .where(eq(soulprintOrders.assessmentId, assessmentId))
    .orderBy(desc(soulprintOrders.createdAt))
    .limit(1);
  return order ?? null;
}

export async function updateSoulprintOrderStripe(orderId: number, checkoutSessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(soulprintOrders)
    .set({ stripeCheckoutSessionId: checkoutSessionId })
    .where(eq(soulprintOrders.id, orderId));
}


// ─── Calibration Helpers ────────────────────────────────────────

export async function saveCalibrationResult(data: {
  assessmentId: number;
  userId: number;
  rankings: any;
  calibratedScores: any;
  calibratedRole: string;
  originalScores: any;
  originalRole: string;
  confidenceScore: number;
}): Promise<Calibration | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.insert(calibrations).values({
    assessmentId: data.assessmentId,
    userId: data.userId,
    rankings: data.rankings,
    calibratedScores: data.calibratedScores,
    calibratedRole: data.calibratedRole,
    originalScores: data.originalScores,
    originalRole: data.originalRole,
    confidenceScore: data.confidenceScore,
  }).returning();
  return row ?? null;
}

export async function getCalibrationByAssessment(assessmentId: number): Promise<Calibration | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(calibrations)
    .where(eq(calibrations.assessmentId, assessmentId))
    .orderBy(desc(calibrations.createdAt))
    .limit(1);
  return result[0] ?? null;
}

// ─── Research Validation Stats ────────────────────────────────────────

export async function getResearchStats() {
  const db = await getDb();
  if (!db) return null;

  // Total assessments
  const [totalRow] = await db.select({ count: count() }).from(assessments);
  const totalAssessments = totalRow.count;

  // Research opt-in count
  const [optInRow] = await db.select({ count: count() }).from(assessments)
    .where(eq(assessments.researchOptIn, true));
  const researchOptIns = optInRow.count;

  // Calibrated assessments (deep calibration completed)
  const [calibRow] = await db.select({ count: count() }).from(calibrations);
  const calibratedCount = calibRow.count;

  // Role distribution for research participants
  const researchRoles = await db.select({
    role: assessments.role,
    count: count(),
  }).from(assessments)
    .where(eq(assessments.researchOptIn, true))
    .groupBy(assessments.role);

  const roleDistribution: Record<string, number> = {};
  for (const r of researchRoles) {
    roleDistribution[r.role] = r.count;
  }

  // Domain distribution for research participants
  const domainCounts = await db.select({
    domain: assessments.domain,
    count: count(),
  }).from(assessments)
    .where(and(
      eq(assessments.researchOptIn, true),
      sql`${assessments.domain} IS NOT NULL`,
    ))
    .groupBy(assessments.domain);

  const domainDistribution: Record<string, number> = {};
  for (const d of domainCounts) {
    if (d.domain) domainDistribution[d.domain] = d.count;
  }

  // Get score distributions for research participants (anonymized)
  const researchScores = await db.select({
    role: assessments.role,
    score: assessments.score,
    scores: assessments.scores,
  }).from(assessments)
    .where(eq(assessments.researchOptIn, true));

  return {
    totalAssessments,
    researchOptIns,
    calibratedCount,
    roleDistribution,
    domainDistribution,
    researchScores: researchScores.map(s => ({
      role: s.role,
      score: s.score,
      scores: s.scores,
    })),
  };
}

export async function updateResearchOptIn(assessmentId: number, optIn: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(assessments).set({ researchOptIn: optIn }).where(eq(assessments.id, assessmentId));
  return true;
}


// ─── SoulPrint Consciousness Layer ───────────────────────────────────────────

export async function saveSoulprintProfile(data: InsertSoulprintProfile): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(soulprintProfiles).values(data).returning({ id: soulprintProfiles.id });
  return result?.id ?? null;
}

export async function getSoulprintByAssessment(assessmentId: number): Promise<SoulprintProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(soulprintProfiles).where(eq(soulprintProfiles.assessmentId, assessmentId)).limit(1);
  return rows[0] ?? null;
}

export async function toggleSoulprintEnabled(id: number, enabled: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(soulprintProfiles).set({ enabled }).where(eq(soulprintProfiles.id, id));
  return true;
}

export async function toggleSoulprintTeamView(id: number, showInTeam: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(soulprintProfiles).set({ showInTeam }).where(eq(soulprintProfiles.id, id));
  return true;
}

export async function setSoulprintConsent(id: number, consentGiven: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(soulprintProfiles).set({ consentGiven, enabled: consentGiven }).where(eq(soulprintProfiles.id, id));
  return true;
}

export async function adminToggleSoulprint(id: number, adminHidden: boolean) {
  const db = await getDb();
  if (!db) return false;
  await db.update(soulprintProfiles).set({ adminHidden }).where(eq(soulprintProfiles.id, id));
  return true;
}

export async function getTeamSoulprints(teamId: number): Promise<Array<SoulprintProfile & { guestName: string | null; role: string }>> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: soulprintProfiles.id,
      assessmentId: soulprintProfiles.assessmentId,
      userId: soulprintProfiles.userId,
      soulprintData: soulprintProfiles.soulprintData,
      enneagramType: soulprintProfiles.enneagramType,
      enneagramWing: soulprintProfiles.enneagramWing,
      humanDesignType: soulprintProfiles.humanDesignType,
      humanDesignProfile: soulprintProfiles.humanDesignProfile,
      enabled: soulprintProfiles.enabled,
      showInTeam: soulprintProfiles.showInTeam,
      consentGiven: soulprintProfiles.consentGiven,
      adminHidden: soulprintProfiles.adminHidden,
      createdAt: soulprintProfiles.createdAt,
      updatedAt: soulprintProfiles.updatedAt,
      guestName: assessments.guestName,
      role: assessments.role,
    })
    .from(soulprintProfiles)
    .innerJoin(assessments, eq(soulprintProfiles.assessmentId, assessments.id))
    .where(and(
      eq(assessments.teamId, teamId),
      eq(soulprintProfiles.showInTeam, true),
      eq(soulprintProfiles.adminHidden, false)
    ));
  return rows as any;
}

// ─── Team Affiliation Helpers ──────────────────────────────────

export async function addTeamAffiliation(teamDomain: string, assessmentId: number, label: string = "candidate"): Promise<TeamAffiliation | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db.insert(teamAffiliations).values({
    teamDomain: teamDomain.toLowerCase().trim(),
    assessmentId,
    label,
  }).returning();
  return row ?? null;
}

export async function getTeamAffiliations(teamDomain: string): Promise<TeamAffiliation[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamAffiliations)
    .where(eq(teamAffiliations.teamDomain, teamDomain.toLowerCase().trim()));
}

export async function removeTeamAffiliation(teamDomain: string, assessmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(teamAffiliations).where(and(
    eq(teamAffiliations.teamDomain, teamDomain.toLowerCase().trim()),
    eq(teamAffiliations.assessmentId, assessmentId)
  ));
}

/**
 * Get all assessments for a team domain, including cross-domain affiliates.
 * Returns { domainMembers, affiliates } so the UI can distinguish them.
 */
export async function getTeamWithAffiliates(domain: string): Promise<{
  domainMembers: Assessment[];
  affiliates: Array<Assessment & { affiliationLabel: string }>;
}> {
  const db = await getDb();
  if (!db) return { domainMembers: [], affiliates: [] };

  const normalized = domain.toLowerCase().trim();

  // Domain members (email matches domain)
  const domainMembers = await db.select().from(assessments)
    .where(eq(assessments.domain, normalized))
    .orderBy(desc(assessments.createdAt));

  // Cross-domain affiliates
  const affiliationRows = await db.select().from(teamAffiliations)
    .where(eq(teamAffiliations.teamDomain, normalized));

  const affiliates: Array<Assessment & { affiliationLabel: string }> = [];
  for (const aff of affiliationRows) {
    const [assessment] = await db.select().from(assessments)
      .where(eq(assessments.id, aff.assessmentId))
      .limit(1);
    if (assessment) {
      affiliates.push({ ...assessment, affiliationLabel: aff.label || "candidate" });
    }
  }

  return { domainMembers, affiliates };
}

// ═══════════════════════════════════════════════════════════════════════
// 360 PEER REVIEW — Database Helpers
// ═══════════════════════════════════════════════════════════════════════

/**
 * Create a new 360 session for a subject.
 * Returns the session with its unique token.
 */
export async function create360Session(data: {
  subjectName: string;
  subjectEmail?: string | null;
  subjectAssessmentId?: number | null;
  subjectUserId?: number | null;
  teamSlug?: string | null;
  selfScores?: Record<string, number> | null;
}): Promise<Flow360Session | null> {
  const db = await getDb();
  if (!db) return null;

  const token = nanoid(24);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const [session] = await db.insert(flow360Sessions).values({
    subjectName: data.subjectName,
    subjectEmail: data.subjectEmail || null,
    subjectAssessmentId: data.subjectAssessmentId || null,
    subjectUserId: data.subjectUserId || null,
    token,
    teamSlug: data.teamSlug || null,
    selfScores: data.selfScores || null,
    expiresAt,
  }).returning();

  return session || null;
}

/**
 * Get a 360 session by its unique token.
 */
export async function get360SessionByToken(token: string): Promise<Flow360Session | null> {
  const db = await getDb();
  if (!db) return null;

  const [session] = await db.select().from(flow360Sessions)
    .where(eq(flow360Sessions.token, token))
    .limit(1);

  return session || null;
}

/**
 * Get a 360 session by assessment ID (to check if one already exists for this subject).
 */
export async function get360SessionByAssessmentId(assessmentId: number): Promise<Flow360Session | null> {
  const db = await getDb();
  if (!db) return null;

  const [session] = await db.select().from(flow360Sessions)
    .where(eq(flow360Sessions.subjectAssessmentId, assessmentId))
    .orderBy(desc(flow360Sessions.id))
    .limit(1);

  return session || null;
}

/**
 * Submit a 360 reviewer response.
 */
export async function submit360Response(data: {
  sessionId: number;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  reviewerRelationship?: string | null;
  sparkRank: number;
  amplifierRank: number;
  filterRank: number;
  groundRank: number;
  conductorRank: number;
}): Promise<Flow360Response | null> {
  const db = await getDb();
  if (!db) return null;

  const [response] = await db.insert(flow360Responses).values({
    sessionId: data.sessionId,
    reviewerName: data.reviewerName || null,
    reviewerEmail: data.reviewerEmail || null,
    reviewerRelationship: data.reviewerRelationship || null,
    sparkRank: data.sparkRank,
    amplifierRank: data.amplifierRank,
    filterRank: data.filterRank,
    groundRank: data.groundRank,
    conductorRank: data.conductorRank,
  }).returning();

  return response || null;
}

/**
 * Get all responses for a 360 session.
 */
export async function get360Responses(sessionId: number): Promise<Flow360Response[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(flow360Responses)
    .where(eq(flow360Responses.sessionId, sessionId))
    .orderBy(desc(flow360Responses.submittedAt));
}

/**
 * Get response count for a 360 session.
 */
export async function get360ResponseCount(sessionId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const rows = await db.select({ cnt: count() }).from(flow360Responses)
    .where(eq(flow360Responses.sessionId, sessionId));

  return rows[0]?.cnt || 0;
}

/**
 * Calculate the gap report for a 360 session.
 * Returns null if fewer than 3 responses.
 */
export async function calculate360GapReport(sessionId: number): Promise<{
  selfScores: Record<string, number>;
  peerScores: Record<string, number>;
  gaps: Array<{ dimension: string; selfScore: number; peerScore: number; gap: number; direction: string }>;
  responseCount: number;
  significantGaps: Array<{ dimension: string; gap: number; direction: string }>;
} | null> {
  const db = await getDb();
  if (!db) return null;

  // Get session for self-scores
  const [session] = await db.select().from(flow360Sessions)
    .where(eq(flow360Sessions.id, sessionId))
    .limit(1);

  if (!session || !session.selfScores) return null;

  // Get all responses
  const responses = await db.select().from(flow360Responses)
    .where(eq(flow360Responses.sessionId, sessionId));

  if (responses.length < 3) return null;

  const selfScores = session.selfScores as Record<string, number>;

  // Calculate peer averages (ranks are 1-5, convert to percentage-like scores)
  // Rank 1 = most like them = highest score, Rank 5 = least = lowest
  // Convert: score = (5 - rank + 1) / 5 * 100 → normalized to percentage
  const dimensions = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
  const rankFields = ["sparkRank", "amplifierRank", "filterRank", "groundRank", "conductorRank"] as const;

  const peerScores: Record<string, number> = {};

  for (let i = 0; i < dimensions.length; i++) {
    const field = rankFields[i];
    const avgRank = responses.reduce((sum, r) => sum + (r[field] || 3), 0) / responses.length;
    // Convert average rank (1-5) to a score (0-100 scale)
    // Rank 1 → 100, Rank 2 → 75, Rank 3 → 50, Rank 4 → 25, Rank 5 → 0
    peerScores[dimensions[i]] = Math.round((5 - avgRank) / 4 * 100);
  }

  // Normalize peer scores to sum to ~100 (like self-assessment percentages)
  const peerTotal = Object.values(peerScores).reduce((a, b) => a + b, 0);
  if (peerTotal > 0) {
    for (const dim of dimensions) {
      peerScores[dim] = Math.round(peerScores[dim] / peerTotal * 100);
    }
  }

  // Calculate gaps
  const gaps = dimensions.map(dim => {
    const selfScore = selfScores[dim] || 0;
    const peerScore = peerScores[dim] || 0;
    const gap = Math.abs(selfScore - peerScore);
    const direction = selfScore > peerScore
      ? "you rate yourself higher"
      : selfScore < peerScore
        ? "peers rate you higher"
        : "aligned";
    return { dimension: dim, selfScore, peerScore, gap, direction };
  });

  // Flag significant gaps (1.5+ rank positions ≈ 15+ percentage points)
  const significantGaps = gaps
    .filter(g => g.gap >= 15)
    .sort((a, b) => b.gap - a.gap);

  return {
    selfScores,
    peerScores,
    gaps,
    responseCount: responses.length,
    significantGaps,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// TRIBE TRIAL HELPERS
// ═══════════════════════════════════════════════════════════════════════

export async function createTribeTrial(data: Omit<InsertTribeTrial, "id" | "createdAt">): Promise<TribeTrial | null> {
  const db = await getDb();
  if (!db) return null;
  const [trial] = await db.insert(tribeTrials).values(data).returning();
  return trial || null;
}

export async function getTrialByEmail(email: string): Promise<TribeTrial | null> {
  const db = await getDb();
  if (!db) return null;
  const [trial] = await db.select().from(tribeTrials)
    .where(eq(tribeTrials.email, email.toLowerCase().trim()))
    .orderBy(desc(tribeTrials.createdAt))
    .limit(1);
  return trial || null;
}

export async function getActiveTrialByEmail(email: string): Promise<TribeTrial | null> {
  const db = await getDb();
  if (!db) return null;
  const [trial] = await db.select().from(tribeTrials)
    .where(and(
      eq(tribeTrials.email, email.toLowerCase().trim()),
      eq(tribeTrials.status, "active")
    ))
    .limit(1);
  return trial || null;
}

export async function cancelTrial(trialId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(tribeTrials)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(tribeTrials.id, trialId));
}

export async function convertTrial(trialId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(tribeTrials)
    .set({ status: "converted", convertedAt: new Date() })
    .where(eq(tribeTrials.id, trialId));
}
