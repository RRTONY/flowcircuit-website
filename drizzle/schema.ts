import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionId: varchar("subscriptionId", { length: 255 }),
  subscriptionStatus: varchar("subscriptionStatus", { length: 64 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teams table - each team has an owner (the manager who created it)
 * maxMembers defaults to 25 for alpha companies
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 16 }).notNull().unique(),
  domain: varchar("domain", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }),
  ownerId: int("ownerId").notNull(),
  logoUrl: text("logoUrl"),
  slackWebhookUrl: text("slackWebhookUrl"),
  weeklyReportEnabled: boolean("weeklyReportEnabled").default(false),
  weeklyReportEmail: varchar("weeklyReportEmail", { length: 320 }),
  maxMembers: int("maxMembers").default(25),
  isAlpha: boolean("isAlpha").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Assessment results - stores each completed assessment linked to a user and optionally a team
 * Now includes Soulprint birth data and sharing preferences
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  teamId: int("teamId"),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  domain: varchar("domain", { length: 255 }),
  role: varchar("role", { length: 64 }).notNull(),
  score: int("score").notNull(),
  scores: json("scores"), // Full role scores breakdown { Spark: 45, Amplifier: 30, ... }
  answers: json("answers"),
  // Soulprint birth data
  birthDate: varchar("birthDate", { length: 16 }),
  birthTime: varchar("birthTime", { length: 8 }),
  birthCity: varchar("birthCity", { length: 255 }),
  // Soulprint API response (stored when API becomes available)
  soulprintData: json("soulprintData"),
  // Sharing
  shareToken: varchar("shareToken", { length: 32 }),
  isPublic: boolean("isPublic").default(false),
  researchOptIn: boolean("researchOptIn").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * Feedback from alpha participants - comments, ratings, impressions
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId"),
  teamId: int("teamId"),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorEmail: varchar("authorEmail", { length: 320 }),
  // What they thought of their individual result
  accuracyRating: int("accuracyRating"), // 1-5 stars
  comment: text("comment"),
  // What they thought of the team dynamic report
  teamInsightRating: int("teamInsightRating"), // 1-5 stars
  teamComment: text("teamComment"),
  // General alpha feedback
  wouldRecommend: boolean("wouldRecommend"),
  suggestion: text("suggestion"),
  // Testimonial fields
  isTestimonial: boolean("isTestimonial").default(false),
  testimonialApproved: boolean("testimonialApproved").default(false),
  testimonialQuote: text("testimonialQuote"),
  authorTitle: varchar("authorTitle", { length: 255 }),
  authorCompany: varchar("authorCompany", { length: 255 }),
  flowCircuitRole: varchar("flowCircuitRole", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;

/**
 * Email verification tokens - used to verify email ownership before granting access to team reports
 */
export const emailVerifications = mysqlTable("email_verifications", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 8 }).notNull(),
  assessmentId: int("assessmentId"),
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

/**
 * Peer reviews (360) - one person rates another person's Flow Circuit role
 * Links to the target assessment and stores the reviewer's perception
 */
export const peerReviews = mysqlTable("peer_reviews", {
  id: int("id").autoincrement().primaryKey(),
  targetAssessmentId: int("targetAssessmentId").notNull(),
  targetName: varchar("targetName", { length: 255 }).notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }).notNull(),
  // The reviewer's perception of the target's role
  perceivedRole: varchar("perceivedRole", { length: 64 }).notNull(),
  perceivedScores: json("perceivedScores"), // { Spark: 30, Amplifier: 25, ... }
  answers: json("answers"),
  // Invite tracking
  inviteToken: varchar("inviteToken", { length: 32 }).notNull().unique(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PeerReview = typeof peerReviews.$inferSelect;
export type InsertPeerReview = typeof peerReviews.$inferInsert;

/**
 * Email drip queue — tracks which onboarding emails have been sent to each user
 * Emails: Day 1 = results recap, Day 3 = invite tribe, Day 7 = stress cost insight
 */
export const emailDrips = mysqlTable("email_drips", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  assessmentId: int("assessmentId"),
  domain: varchar("domain", { length: 255 }),
  role: varchar("role", { length: 64 }),
  // Drip tracking
  day1Sent: boolean("day1Sent").default(false),
  day1SentAt: timestamp("day1SentAt"),
  day3Sent: boolean("day3Sent").default(false),
  day3SentAt: timestamp("day3SentAt"),
  day7Sent: boolean("day7Sent").default(false),
  day7SentAt: timestamp("day7SentAt"),
  unsubscribed: boolean("unsubscribed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailDrip = typeof emailDrips.$inferSelect;
export type InsertEmailDrip = typeof emailDrips.$inferInsert;

/**
 * SoulPrint orders — tracks SoulPrint purchases and report generation
 * First 1,000 are free (alpha). After that, $44 per report.
 * Tier controls the framing/language of the report, not the depth of data.
 */
export const soulprintOrders = mysqlTable("soulprint_orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  assessmentId: int("assessmentId"),
  // User info (for guest purchases)
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  // Birth data for SoulPrint generation
  birthDate: varchar("birthDate", { length: 16 }).notNull(),
  birthTime: varchar("birthTime", { length: 8 }),
  birthCity: varchar("birthCity", { length: 255 }).notNull(),
  birthCountry: varchar("birthCountry", { length: 128 }),
  birthLatitude: varchar("birthLatitude", { length: 32 }),
  birthLongitude: varchar("birthLongitude", { length: 32 }),
  // Tier selection
  tier: mysqlEnum("tier", ["blueprint", "compass", "oracle"]).notNull().default("compass"),
  // Report type
  reportType: mysqlEnum("reportType", ["soulprint_only", "combined"]).notNull().default("combined"),
  // Payment
  isAlpha: boolean("isAlpha").default(false),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  amountPaid: int("amountPaid").default(0), // in cents
  // SoulPrint API integration (placeholder until Max provides API)
  soulprintSessionId: varchar("soulprintSessionId", { length: 255 }),
  soulprintStatus: mysqlEnum("soulprintStatus", ["pending", "processing", "completed", "failed"]).default("pending"),
  soulprintData: json("soulprintData"),
  // Combined report data (Flow Circuit + SoulPrint synthesis)
  combinedReportData: json("combinedReportData"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SoulprintOrder = typeof soulprintOrders.$inferSelect;
export type InsertSoulprintOrder = typeof soulprintOrders.$inferInsert;


/**
 * Deep Calibration — forced-ranking ipsative recalibration of Flow Circuit scores.
 * Links to an existing assessment to provide a "verified" recalibrated profile.
 */
export const calibrations = mysqlTable("calibrations", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  userId: int("userId"),
  // Rankings stored as JSON: array of { setId, rankings: [role1, role2, role3, role4] } most→least
  rankings: json("rankings").notNull(),
  // Recalibrated ipsative scores
  calibratedScores: json("calibratedScores").notNull(), // { Spark: 45, Amplifier: 30, ... }
  calibratedRole: varchar("calibratedRole", { length: 64 }).notNull(),
  // Delta from original
  originalScores: json("originalScores"),
  originalRole: varchar("originalRole", { length: 64 }),
  confidenceScore: int("confidenceScore"), // 0-100 how consistent the rankings were
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Calibration = typeof calibrations.$inferSelect;
export type InsertCalibration = typeof calibrations.$inferInsert;

/**
 * SoulPrint Consciousness Layer — stores the full TrueSelf SoulPrint reading
 * as a toggleable overlay on the Flow Circuit profile.
 * Users opt in via consent dialog; can toggle visibility on/off for self and team.
 */
export const soulprintProfiles = mysqlTable("soulprint_profiles", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  userId: int("userId"),
  // Full SoulPrint JSON from TrueSelf API (all topic sections)
  soulprintData: json("soulprintData").notNull(),
  // Extracted Enneagram type for cross-reference with Flow Circuit role
  enneagramType: varchar("enneagramType", { length: 64 }),
  enneagramWing: varchar("enneagramWing", { length: 64 }),
  // Human Design type
  humanDesignType: varchar("humanDesignType", { length: 64 }),
  humanDesignProfile: varchar("humanDesignProfile", { length: 64 }),
  // Visibility toggles
  enabled: boolean("enabled").default(false), // show on own profile
  showInTeam: boolean("showInTeam").default(false), // show in team view
  consentGiven: boolean("consentGiven").default(false), // user opted in
  // Admin control
  adminHidden: boolean("adminHidden").default(false), // admin can hide site-wide
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SoulprintProfile = typeof soulprintProfiles.$inferSelect;
export type InsertSoulprintProfile = typeof soulprintProfiles.$inferInsert;

/**
 * Team Affiliations — links cross-domain members to a team.
 * E.g. Darryl (wishup.in) affiliated with ramprate.com team.
 * Used by the /team/:domain page to include members whose email domain differs.
 */
export const teamAffiliations = mysqlTable("team_affiliations", {
  id: int("id").autoincrement().primaryKey(),
  teamDomain: varchar("teamDomain", { length: 255 }).notNull(),
  assessmentId: int("assessmentId").notNull(),
  label: varchar("label", { length: 64 }).default("candidate"), // 'member' | 'candidate' | 'advisor'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeamAffiliation = typeof teamAffiliations.$inferSelect;
export type InsertTeamAffiliation = typeof teamAffiliations.$inferInsert;

/**
 * 360 Peer Review Sessions — subject generates a unique link for reviewers.
 * Each session has a token that maps to the subject. Reviewers don't need accounts.
 */
export const flow360Sessions = mysqlTable("flow_360_sessions", {
  id: int("id").autoincrement().primaryKey(),
  subjectName: varchar("subjectName", { length: 255 }).notNull(),
  subjectEmail: varchar("subjectEmail", { length: 320 }),
  subjectAssessmentId: int("subjectAssessmentId"), // links to their self-assessment
  subjectUserId: int("subjectUserId"), // links to users table if logged in
  token: varchar("token", { length: 64 }).notNull().unique(),
  teamSlug: varchar("teamSlug", { length: 255 }),
  // Self-assessment scores for gap comparison
  selfScores: json("selfScores"), // { Spark: 50, Amplifier: 36, ... }
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type Flow360Session = typeof flow360Sessions.$inferSelect;
export type InsertFlow360Session = typeof flow360Sessions.$inferInsert;

/**
 * 360 Peer Review Responses — each reviewer submits a forced-rank rating.
 * Ranks are 1-5 (1 = most like them, 5 = least like them).
 * Reviewer identity is optional (anonymous by default).
 */
export const flow360Responses = mysqlTable("flow_360_responses", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }),
  reviewerEmail: varchar("reviewerEmail", { length: 320 }),
  reviewerRelationship: varchar("reviewerRelationship", { length: 128 }),
  // Forced-rank scores (1 = most like them, 5 = least like them)
  sparkRank: int("sparkRank").notNull(),
  amplifierRank: int("amplifierRank").notNull(),
  filterRank: int("filterRank").notNull(),
  groundRank: int("groundRank").notNull(),
  conductorRank: int("conductorRank").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type Flow360Response = typeof flow360Responses.$inferSelect;
export type InsertFlow360Response = typeof flow360Responses.$inferInsert;

/**
 * Tribe Trials — 30-day free trial for the Tribe plan.
 * No credit card required. Converts to $29/member/month after day 30.
 */
export const tribeTrials = mysqlTable("tribe_trials", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  userId: int("userId"),
  teamId: int("teamId"),
  status: mysqlEnum("status", ["active", "expired", "converted", "cancelled"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  convertedAt: timestamp("convertedAt"),
  cancelledAt: timestamp("cancelledAt"),
  source: varchar("source", { length: 64 }), // 'results_page', '360_link', '360_gap', 'pricing', 'pdf'
  lastDripDay: int("lastDripDay"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TribeTrial = typeof tribeTrials.$inferSelect;
export type InsertTribeTrial = typeof tribeTrials.$inferInsert;
