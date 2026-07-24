import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { like, or, eq } from "drizzle-orm";
import * as schema from "./drizzle/schema";

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });

  // Search for Rob in assessments
  const robAssessments = await db.select().from(schema.assessments).where(
    or(
      like(schema.assessments.guestName, "%Rob%"),
      like(schema.assessments.guestName, "%rob%"),
      like(schema.assessments.guestEmail, "%rob%")
    )
  );

  console.log("\n=== ROB SEARCH RESULTS ===");
  if (robAssessments.length === 0) {
    console.log("Rob has NOT taken the assessment yet.");
  } else {
    robAssessments.forEach(a => {
      console.log(`  ID: ${a.id} | Name: ${a.guestName} | Email: ${a.guestEmail} | Role: ${a.role} | Score: ${a.score}`);
    });
  }

  // Also show the full current RampRate team
  const ramprate = await db.select().from(schema.assessments).where(
    or(
      like(schema.assessments.guestEmail, "%ramprate.com%"),
      like(schema.assessments.guestEmail, "%impactsoul%")
    )
  );

  console.log("\n=== CURRENT RAMPRATE/IMPACTSOUL ROSTER ===");
  ramprate.forEach(a => {
    console.log(`  ID: ${a.id} | Name: ${a.guestName} | Email: ${a.guestEmail} | Role: ${a.role} | Score: ${a.score}`);
  });

  // Check team_affiliations
  const affiliates = await db.select().from(schema.teamAffiliations).where(
    eq(schema.teamAffiliations.teamDomain, "ramprate.com")
  );
  console.log("\n=== TEAM AFFILIATIONS (ramprate.com) ===");
  affiliates.forEach(a => {
    console.log(`  Assessment ID: ${a.assessmentId} | Type: ${a.affiliationType}`);
  });

  await connection.end();
}

main().catch(console.error);
