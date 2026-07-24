import { boolean, check, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow (NextAuth.js Credentials provider).
 */
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    passwordHash: text("passwordHash"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: varchar("role", { length: 16 }).default("user").notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    subscriptionId: varchar("subscriptionId", { length: 255 }),
    subscriptionStatus: varchar("subscriptionStatus", { length: 64 }),
  },
  (table) => [check("users_role_check", sql`${table.role} IN ('user', 'admin')`)]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams table - each team has an owner (the manager who created it)
 * maxMembers defaults to 25 for alpha companies
 */
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  ownerId: integer("ownerId").notNull(),
  logoUrl: text("logoUrl"),
  slackWebhookUrl: text("slackWebhookUrl"),
  weeklyReportEnabled: boolean("weeklyReportEnabled").default(false),
  weeklyReportEmail: varchar("weeklyReportEmail", { length: 320 }),
  maxMembers: integer("maxMembers").default(25),
  isAlpha: boolean("isAlpha").default(true),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Assessment results - stores each completed assessment linked to a user and optionally a team
 * Includes Soulprint birth data and sharing preferences
 */
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  teamId: integer("teamId"),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  domain: varchar("domain", { length: 255 }),
  role: varchar("role", { length: 64 }).notNull(),
  score: integer("score").notNull(),
  scores: jsonb("scores"), // Full role scores breakdown { Spark: 45, Amplifier: 30, ... }
  answers: jsonb("answers"),
  // Soulprint birth data
  birthDate: varchar("birthDate", { length: 16 }),
  birthTime: varchar("birthTime", { length: 8 }),
  birthCity: varchar("birthCity", { length: 255 }),
  // Soulprint API response (stored when API becomes available)
  soulprintData: jsonb("soulprintData"),
  // Sharing
  shareToken: varchar("shareToken", { length: 32 }),
  isPublic: boolean("isPublic").default(false),
  researchOptIn: boolean("researchOptIn").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * Feedback from alpha participants - comments, ratings, impressions
 */
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId"),
  teamId: integer("teamId"),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  accuracyRating: integer("accuracyRating"), // 1-5 stars
  comment: text("comment"),
  teamInsightRating: integer("teamInsightRating"), // 1-5 stars
  teamComment: text("teamComment"),
  wouldRecommend: boolean("wouldRecommend"),
  suggestion: text("suggestion"),
  isTestimonial: boolean("isTestimonial").default(false),
  testimonialApproved: boolean("testimonialApproved").default(false),
  testimonialQuote: text("testimonialQuote"),
  authorTitle: varchar("authorTitle", { length: 255 }),
  authorCompany: varchar("authorCompany", { length: 255 }),
  flowCircuitRole: varchar("flowCircuitRole", { length: 64 }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * Email verification tokens - used to verify email ownership before granting access to team reports
 */
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 8 }).notNull(),
  assessmentId: integer("assessmentId"),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

/**
 * Peer reviews (360) - one person rates another person's Flow Circuit role
 * Links to the target assessment and stores the reviewer's perception
 */
export const peerReviews = pgTable("peer_reviews", {
  id: serial("id").primaryKey(),
  targetAssessmentId: integer("targetAssessmentId").notNull(),
  targetName: varchar("targetName", { length: 255 }).notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }).notNull(),
  perceivedRole: varchar("perceivedRole", { length: 64 }).notNull(),
  perceivedScores: jsonb("perceivedScores"), // { Spark: 30, Amplifier: 25, ... }
  answers: jsonb("answers"),
  inviteToken: varchar("inviteToken", { length: 32 }).notNull().unique(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type PeerReview = typeof peerReviews.$inferSelect;
export type InsertPeerReview = typeof peerReviews.$inferInsert;

/**
 * Email drip queue — tracks which onboarding emails have been sent to each user
 * Emails: Day 1 = results recap, Day 3 = invite tribe, Day 7 = stress cost insight
 */
export const emailDrips = pgTable("email_drips", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  assessmentId: integer("assessmentId"),
  domain: varchar("domain", { length: 255 }),
  role: varchar("role", { length: 64 }),
  day1Sent: boolean("day1Sent").default(false),
  day1SentAt: timestamp("day1SentAt", { withTimezone: true }),
  day3Sent: boolean("day3Sent").default(false),
  day3SentAt: timestamp("day3SentAt", { withTimezone: true }),
  day7Sent: boolean("day7Sent").default(false),
  day7SentAt: timestamp("day7SentAt", { withTimezone: true }),
  unsubscribed: boolean("unsubscribed").default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type EmailDrip = typeof emailDrips.$inferSelect;
export type InsertEmailDrip = typeof emailDrips.$inferInsert;

/**
 * SoulPrint orders — tracks SoulPrint purchases and report generation
 * First 1,000 are free (alpha). After that, $44 per report.
 * Tier controls the framing/language of the report, not the depth of data.
 */
export const soulprintOrders = pgTable(
  "soulprint_orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId"),
    assessmentId: integer("assessmentId"),
    guestName: varchar("guestName", { length: 255 }),
    guestEmail: varchar("guestEmail", { length: 320 }),
    birthDate: varchar("birthDate", { length: 16 }).notNull(),
    birthTime: varchar("birthTime", { length: 8 }),
    birthCity: varchar("birthCity", { length: 255 }).notNull(),
    birthCountry: varchar("birthCountry", { length: 128 }),
    birthLatitude: varchar("birthLatitude", { length: 32 }),
    birthLongitude: varchar("birthLongitude", { length: 32 }),
    tier: varchar("tier", { length: 16 }).notNull().default("compass"),
    reportType: varchar("reportType", { length: 16 }).notNull().default("combined"),
    isAlpha: boolean("isAlpha").default(false),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
    amountPaid: integer("amountPaid").default(0), // in cents
    soulprintSessionId: varchar("soulprintSessionId", { length: 255 }),
    soulprintStatus: varchar("soulprintStatus", { length: 16 }).default("pending"),
    soulprintData: jsonb("soulprintData"),
    combinedReportData: jsonb("combinedReportData"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completedAt", { withTimezone: true }),
  },
  (table) => [
    check("soulprint_orders_tier_check", sql`${table.tier} IN ('blueprint', 'compass', 'oracle')`),
    check("soulprint_orders_report_type_check", sql`${table.reportType} IN ('soulprint_only', 'combined')`),
    check(
      "soulprint_orders_status_check",
      sql`${table.soulprintStatus} IN ('pending', 'processing', 'completed', 'failed')`
    ),
  ]
);

export type SoulprintOrder = typeof soulprintOrders.$inferSelect;
export type InsertSoulprintOrder = typeof soulprintOrders.$inferInsert;

/**
 * Deep Calibration — forced-ranking ipsative recalibration of Flow Circuit scores.
 * Links to an existing assessment to provide a "verified" recalibrated profile.
 */
export const calibrations = pgTable("calibrations", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId").notNull(),
  userId: integer("userId"),
  // Rankings stored as JSON: array of { setId, rankings: [role1, role2, role3, role4] } most→least
  rankings: jsonb("rankings").notNull(),
  calibratedScores: jsonb("calibratedScores").notNull(), // { Spark: 45, Amplifier: 30, ... }
  calibratedRole: varchar("calibratedRole", { length: 64 }).notNull(),
  originalScores: jsonb("originalScores"),
  originalRole: varchar("originalRole", { length: 64 }),
  confidenceScore: integer("confidenceScore"), // 0-100 how consistent the rankings were
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});
export type Calibration = typeof calibrations.$inferSelect;
export type InsertCalibration = typeof calibrations.$inferInsert;

/**
 * SoulPrint Consciousness Layer — stores the full TrueSelf SoulPrint reading
 * as a toggleable overlay on the Flow Circuit profile.
 * Users opt in via consent dialog; can toggle visibility on/off for self and team.
 */
export const soulprintProfiles = pgTable("soulprint_profiles", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessmentId").notNull(),
  userId: integer("userId"),
  soulprintData: jsonb("soulprintData").notNull(),
  enneagramType: varchar("enneagramType", { length: 64 }),
  enneagramWing: varchar("enneagramWing", { length: 64 }),
  humanDesignType: varchar("humanDesignType", { length: 64 }),
  humanDesignProfile: varchar("humanDesignProfile", { length: 64 }),
  enabled: boolean("enabled").default(false), // show on own profile
  showInTeam: boolean("showInTeam").default(false), // show in team view
  consentGiven: boolean("consentGiven").default(false), // user opted in
  adminHidden: boolean("adminHidden").default(false), // admin can hide site-wide
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type SoulprintProfile = typeof soulprintProfiles.$inferSelect;
export type InsertSoulprintProfile = typeof soulprintProfiles.$inferInsert;

/**
 * Team Affiliations — links cross-domain members to a team.
 * E.g. Darryl (wishup.in) affiliated with ramprate.com team.
 * Used by the /team/:domain page to include members whose email domain differs.
 */
export const teamAffiliations = pgTable("team_affiliations", {
  id: serial("id").primaryKey(),
  teamDomain: varchar("teamDomain", { length: 255 }).notNull(),
  assessmentId: integer("assessmentId").notNull(),
  label: varchar("label", { length: 64 }).default("candidate"), // 'member' | 'candidate' | 'advisor'
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type TeamAffiliation = typeof teamAffiliations.$inferSelect;
export type InsertTeamAffiliation = typeof teamAffiliations.$inferInsert;

/**
 * 360 Peer Review Sessions — subject generates a unique link for reviewers.
 * Each session has a token that maps to the subject. Reviewers don't need accounts.
 */
export const flow360Sessions = pgTable("flow_360_sessions", {
  id: serial("id").primaryKey(),
  subjectName: varchar("subjectName", { length: 255 }).notNull(),
  subjectEmail: varchar("subjectEmail", { length: 320 }),
  subjectAssessmentId: integer("subjectAssessmentId"), // links to their self-assessment
  subjectUserId: integer("subjectUserId"), // links to users table if logged in
  token: varchar("token", { length: 64 }).notNull().unique(),
  teamSlug: varchar("teamSlug", { length: 255 }),
  selfScores: jsonb("selfScores"), // { Spark: 50, Amplifier: 36, ... }
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
});

export type Flow360Session = typeof flow360Sessions.$inferSelect;
export type InsertFlow360Session = typeof flow360Sessions.$inferInsert;

/**
 * 360 Peer Review Responses — each reviewer submits a forced-rank rating.
 * Ranks are 1-5 (1 = most like them, 5 = least like them).
 * Reviewer identity is optional (anonymous by default).
 */
export const flow360Responses = pgTable("flow_360_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  reviewerRelationship: varchar("reviewerRelationship", { length: 128 }),
  sparkRank: integer("sparkRank").notNull(),
  amplifierRank: integer("amplifierRank").notNull(),
  filterRank: integer("filterRank").notNull(),
  groundRank: integer("groundRank").notNull(),
  conductorRank: integer("conductorRank").notNull(),
  submittedAt: timestamp("submittedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Flow360Response = typeof flow360Responses.$inferSelect;
export type InsertFlow360Response = typeof flow360Responses.$inferInsert;

/**
 * Tribe Trials — 30-day free trial for the Tribe plan.
 * No credit card required. Converts to $29/member/month after day 30.
 */
export const tribeTrials = pgTable(
  "tribe_trials",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: integer("userId"),
    teamId: integer("teamId"),
    status: varchar("status", { length: 16 }).default("active").notNull(),
    startedAt: timestamp("startedAt", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    convertedAt: timestamp("convertedAt", { withTimezone: true }),
    cancelledAt: timestamp("cancelledAt", { withTimezone: true }),
    source: varchar("source", { length: 64 }), // 'results_page', '360_link', '360_gap', 'pricing', 'pdf'
    lastDripDay: integer("lastDripDay"),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("tribe_trials_status_check", sql`${table.status} IN ('active', 'expired', 'converted', 'cancelled')`),
  ]
);

export type TribeTrial = typeof tribeTrials.$inferSelect;
export type InsertTribeTrial = typeof tribeTrials.$inferInsert;
