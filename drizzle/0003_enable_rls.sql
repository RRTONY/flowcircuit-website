ALTER TABLE "assessments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "calibrations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_drips" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "email_verifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "flow_360_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "flow_360_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "password_resets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "peer_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "soulprint_orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "soulprint_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "team_affiliations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tribe_trials" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER FUNCTION "public"."set_updated_at"() SET search_path = '';