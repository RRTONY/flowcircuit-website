CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"teamId" integer,
	"guestName" varchar(255),
	"guestEmail" varchar(320),
	"domain" varchar(255),
	"role" varchar(64) NOT NULL,
	"score" integer NOT NULL,
	"scores" jsonb,
	"answers" jsonb,
	"birthDate" varchar(16),
	"birthTime" varchar(8),
	"birthCity" varchar(255),
	"soulprintData" jsonb,
	"shareToken" varchar(32),
	"isPublic" boolean DEFAULT false,
	"researchOptIn" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calibrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessmentId" integer NOT NULL,
	"userId" integer,
	"rankings" jsonb NOT NULL,
	"calibratedScores" jsonb NOT NULL,
	"calibratedRole" varchar(64) NOT NULL,
	"originalScores" jsonb,
	"originalRole" varchar(64),
	"confidenceScore" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_drips" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"assessmentId" integer,
	"domain" varchar(255),
	"role" varchar(64),
	"day1Sent" boolean DEFAULT false,
	"day1SentAt" timestamp with time zone,
	"day3Sent" boolean DEFAULT false,
	"day3SentAt" timestamp with time zone,
	"day7Sent" boolean DEFAULT false,
	"day7SentAt" timestamp with time zone,
	"unsubscribed" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"code" varchar(8) NOT NULL,
	"assessmentId" integer,
	"verified" boolean DEFAULT false,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessmentId" integer,
	"teamId" integer,
	"authorName" varchar(255) NOT NULL,
	"authorEmail" varchar(320),
	"accuracyRating" integer,
	"comment" text,
	"teamInsightRating" integer,
	"teamComment" text,
	"wouldRecommend" boolean,
	"suggestion" text,
	"isTestimonial" boolean DEFAULT false,
	"testimonialApproved" boolean DEFAULT false,
	"testimonialQuote" text,
	"authorTitle" varchar(255),
	"authorCompany" varchar(255),
	"flowCircuitRole" varchar(64),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flow_360_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"sessionId" integer NOT NULL,
	"reviewerName" varchar(255),
	"reviewerEmail" varchar(320),
	"reviewerRelationship" varchar(128),
	"sparkRank" integer NOT NULL,
	"amplifierRank" integer NOT NULL,
	"filterRank" integer NOT NULL,
	"groundRank" integer NOT NULL,
	"conductorRank" integer NOT NULL,
	"submittedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flow_360_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subjectName" varchar(255) NOT NULL,
	"subjectEmail" varchar(320),
	"subjectAssessmentId" integer,
	"subjectUserId" integer,
	"token" varchar(64) NOT NULL,
	"teamSlug" varchar(255),
	"selfScores" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	CONSTRAINT "flow_360_sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "peer_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"targetAssessmentId" integer NOT NULL,
	"targetName" varchar(255) NOT NULL,
	"reviewerName" varchar(255) NOT NULL,
	"reviewerEmail" varchar(320) NOT NULL,
	"perceivedRole" varchar(64) NOT NULL,
	"perceivedScores" jsonb,
	"answers" jsonb,
	"inviteToken" varchar(32) NOT NULL,
	"completed" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone,
	CONSTRAINT "peer_reviews_inviteToken_unique" UNIQUE("inviteToken")
);
--> statement-breakpoint
CREATE TABLE "soulprint_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"assessmentId" integer,
	"guestName" varchar(255),
	"guestEmail" varchar(320),
	"birthDate" varchar(16) NOT NULL,
	"birthTime" varchar(8),
	"birthCity" varchar(255) NOT NULL,
	"birthCountry" varchar(128),
	"birthLatitude" varchar(32),
	"birthLongitude" varchar(32),
	"tier" varchar(16) DEFAULT 'compass' NOT NULL,
	"reportType" varchar(16) DEFAULT 'combined' NOT NULL,
	"isAlpha" boolean DEFAULT false,
	"stripePaymentIntentId" varchar(255),
	"stripeCheckoutSessionId" varchar(255),
	"amountPaid" integer DEFAULT 0,
	"soulprintSessionId" varchar(255),
	"soulprintStatus" varchar(16) DEFAULT 'pending',
	"soulprintData" jsonb,
	"combinedReportData" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"completedAt" timestamp with time zone,
	CONSTRAINT "soulprint_orders_tier_check" CHECK ("soulprint_orders"."tier" IN ('blueprint', 'compass', 'oracle')),
	CONSTRAINT "soulprint_orders_report_type_check" CHECK ("soulprint_orders"."reportType" IN ('soulprint_only', 'combined')),
	CONSTRAINT "soulprint_orders_status_check" CHECK ("soulprint_orders"."soulprintStatus" IN ('pending', 'processing', 'completed', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "soulprint_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessmentId" integer NOT NULL,
	"userId" integer,
	"soulprintData" jsonb NOT NULL,
	"enneagramType" varchar(64),
	"enneagramWing" varchar(64),
	"humanDesignType" varchar(64),
	"humanDesignProfile" varchar(64),
	"enabled" boolean DEFAULT false,
	"showInTeam" boolean DEFAULT false,
	"consentGiven" boolean DEFAULT false,
	"adminHidden" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_affiliations" (
	"id" serial PRIMARY KEY NOT NULL,
	"teamDomain" varchar(255) NOT NULL,
	"assessmentId" integer NOT NULL,
	"label" varchar(64) DEFAULT 'candidate',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(16) NOT NULL,
	"domain" varchar(255),
	"name" varchar(255) NOT NULL,
	"companyName" varchar(255),
	"ownerId" integer NOT NULL,
	"logoUrl" text,
	"slackWebhookUrl" text,
	"weeklyReportEnabled" boolean DEFAULT false,
	"weeklyReportEmail" varchar(320),
	"maxMembers" integer DEFAULT 25,
	"isAlpha" boolean DEFAULT true,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_code_unique" UNIQUE("code"),
	CONSTRAINT "teams_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "tribe_trials" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255) NOT NULL,
	"userId" integer,
	"teamId" integer,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"startedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"convertedAt" timestamp with time zone,
	"cancelledAt" timestamp with time zone,
	"source" varchar(64),
	"lastDripDay" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tribe_trials_status_check" CHECK ("tribe_trials"."status" IN ('active', 'expired', 'converted', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"passwordHash" text,
	"loginMethod" varchar(64),
	"role" varchar(16) DEFAULT 'user' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp with time zone DEFAULT now() NOT NULL,
	"stripeCustomerId" varchar(255),
	"subscriptionId" varchar(255),
	"subscriptionStatus" varchar(64),
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_role_check" CHECK ("users"."role" IN ('user', 'admin'))
);
