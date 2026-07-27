-- Postgres has no native "ON UPDATE CURRENT_TIMESTAMP" (the MySQL behavior
-- schema.ts previously relied on for users.updatedAt, teams.updatedAt, and
-- soulprint_profiles.updatedAt) -- replicate it with a trigger function.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER teams_set_updated_at
  BEFORE UPDATE ON "teams"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER soulprint_profiles_set_updated_at
  BEFORE UPDATE ON "soulprint_profiles"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
