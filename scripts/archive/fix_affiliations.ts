import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as schema from "./drizzle/schema";

async function main() {
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL!,
    connectTimeout: 10000,
  });
  const db = drizzle(connection, { schema, mode: "default" });

  try {
    // Update Kim (assessment ID 360001) to member
    await db.update(schema.teamAffiliations)
      .set({ label: "member" })
      .where(eq(schema.teamAffiliations.assessmentId, 360001));
    console.log("✅ Kim → member");

    // Update Josh (assessment ID 450001) to member
    await db.update(schema.teamAffiliations)
      .set({ label: "member" })
      .where(eq(schema.teamAffiliations.assessmentId, 450001));
    console.log("✅ Josh → member");

    // Update Darryl (assessment ID 630001) to candidate
    await db.update(schema.teamAffiliations)
      .set({ label: "candidate" })
      .where(eq(schema.teamAffiliations.assessmentId, 630001));
    console.log("✅ Darryl → candidate");

    // Verify
    const all = await db.select().from(schema.teamAffiliations).where(
      eq(schema.teamAffiliations.teamDomain, "ramprate.com")
    );
    console.log("\nUpdated affiliations:");
    all.forEach(a => console.log(`  ID: ${a.assessmentId} | Type: ${a.affiliationType}`));
  } finally {
    await connection.end();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
