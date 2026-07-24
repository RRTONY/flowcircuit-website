/**
 * One-time data migration: Manus-provisioned TiDB (MySQL) -> Supabase (Postgres).
 *
 * Not part of the deployed app. Run manually, once, after the Postgres schema
 * has been pushed to Supabase (`pnpm db:push`) and before DNS cutover.
 *
 * Usage:
 *   TIDB_SOURCE_URL=... DATABASE_URL=... pnpm tsx scripts/migrate-data.ts [--dry-run]
 *
 * Requires `mysql2` (source read) and `postgres` (target write) as installed deps.
 */
import "dotenv/config";
import mysql from "mysql2/promise";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../drizzle/schema";

const DRY_RUN = process.argv.includes("--dry-run");

// TiDB Cloud connection string arrives with a non-standard `ssl={"rejectUnauthorized":true}`
// query param that isn't a valid URI component, so we parse the pieces out manually
// rather than passing the raw string to a URL parser.
function parseTidbUrl(raw: string) {
  const withoutQuery = raw.split("?")[0];
  const match = withoutQuery.match(/^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
  if (!match) throw new Error("Could not parse TIDB_SOURCE_URL — expected mysql://user:pass@host:port/db");
  const [, user, password, host, port, database] = match;
  return { host, port: Number(port), user: decodeURIComponent(password) ? user : user, password, database };
}

async function main() {
  const tidbUrl = process.env.TIDB_SOURCE_URL;
  const pgUrl = process.env.DATABASE_URL;
  if (!tidbUrl) throw new Error("TIDB_SOURCE_URL is not set");
  if (!pgUrl) throw new Error("DATABASE_URL is not set");

  const { host, port, user, password, database } = parseTidbUrl(tidbUrl);
  const source = await mysql.createConnection({
    host, port, user, password, database,
    ssl: { rejectUnauthorized: true },
  });

  const pgClient = postgres(pgUrl, { prepare: false });
  const target = drizzle(pgClient, { schema });

  console.log(`[migrate] Connected to source (TiDB) and target (Supabase Postgres).${DRY_RUN ? " DRY RUN — no writes will happen." : ""}`);

  // Order matters: parents before children (assessments references users/teams, etc.)
  const tables: Array<{ name: string; mysqlTable: string; pgTable: any }> = [
    { name: "users", mysqlTable: "users", pgTable: schema.users },
    { name: "teams", mysqlTable: "teams", pgTable: schema.teams },
    { name: "assessments", mysqlTable: "assessments", pgTable: schema.assessments },
    { name: "feedback", mysqlTable: "feedback", pgTable: schema.feedback },
    { name: "email_verifications", mysqlTable: "email_verifications", pgTable: schema.emailVerifications },
    { name: "peer_reviews", mysqlTable: "peer_reviews", pgTable: schema.peerReviews },
    { name: "email_drips", mysqlTable: "email_drips", pgTable: schema.emailDrips },
    { name: "soulprint_orders", mysqlTable: "soulprint_orders", pgTable: schema.soulprintOrders },
    { name: "calibrations", mysqlTable: "calibrations", pgTable: schema.calibrations },
    { name: "soulprint_profiles", mysqlTable: "soulprint_profiles", pgTable: schema.soulprintProfiles },
    { name: "team_affiliations", mysqlTable: "team_affiliations", pgTable: schema.teamAffiliations },
    { name: "flow_360_sessions", mysqlTable: "flow_360_sessions", pgTable: schema.flow360Sessions },
    { name: "flow_360_responses", mysqlTable: "flow_360_responses", pgTable: schema.flow360Responses },
    { name: "tribe_trials", mysqlTable: "tribe_trials", pgTable: schema.tribeTrials },
  ];

  const JSON_COLUMNS = new Set([
    "scores", "answers", "soulprintData", "perceivedScores", "rankings",
    "calibratedScores", "originalScores", "combinedReportData", "selfScores",
  ]);

  const summary: Record<string, { source: number; inserted: number }> = {};

  for (const { name, mysqlTable, pgTable } of tables) {
    const [rows] = await source.query(`SELECT * FROM \`${mysqlTable}\``);
    const rowArray = rows as Record<string, unknown>[];
    summary[name] = { source: rowArray.length, inserted: 0 };

    if (rowArray.length === 0) {
      console.log(`[migrate] ${name}: 0 rows in source, skipping`);
      continue;
    }

    // mysql2 returns JSON columns already parsed for JSON-typed columns; guard against
    // the rare case where a value comes back as a raw string that needs parsing.
    const transformed = rowArray.map((row) => {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (JSON_COLUMNS.has(key) && typeof value === "string") {
          try {
            out[key] = JSON.parse(value);
            continue;
          } catch {
            // fall through, keep raw value
          }
        }
        out[key] = value;
      }
      return out;
    });

    if (DRY_RUN) {
      console.log(`[migrate] ${name}: would insert ${transformed.length} rows (dry run)`);
      continue;
    }

    // Insert in batches, preserving the source `id` (identity columns still accept
    // explicit values on insert; sequences are resynced afterward).
    const BATCH_SIZE = 200;
    for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
      const batch = transformed.slice(i, i + BATCH_SIZE);
      await target.insert(pgTable).values(batch as any).onConflictDoNothing();
      summary[name].inserted += batch.length;
    }
    console.log(`[migrate] ${name}: inserted ${summary[name].inserted}/${rowArray.length} rows`);
  }

  if (!DRY_RUN) {
    // Resync every serial sequence to MAX(id)+1 since we inserted explicit ids.
    for (const { name, pgTable } of tables) {
      const tableName = (pgTable as any)[Symbol.for("drizzle:Name")] ?? name;
      await pgClient.unsafe(
        `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 1))`
      );
    }
    console.log("[migrate] Resynced all id sequences.");
  }

  console.log("\n[migrate] Row-count summary (source -> inserted):");
  for (const [name, { source: s, inserted }] of Object.entries(summary)) {
    const flag = !DRY_RUN && s !== inserted ? "  ⚠ MISMATCH" : "";
    console.log(`  ${name}: ${s} -> ${inserted}${flag}`);
  }

  await source.end();
  await pgClient.end();
}

main().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
