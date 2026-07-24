import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as schema from "./drizzle/schema";

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN!;
const ROB_SLACK_ID = "U09F5HWTHGR"; // Rob Holmes

async function sendSlackDM(userId: string, text: string) {
  // Open DM channel
  const openRes = await fetch("https://slack.com/api/conversations.open", {
    method: "POST",
    headers: { "Authorization": `Bearer ${SLACK_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ users: userId }),
  });
  const openData = await openRes.json() as any;
  if (!openData.ok) { console.error("Failed to open DM:", openData.error); return false; }

  // Send message
  const msgRes = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "Authorization": `Bearer ${SLACK_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: openData.channel.id,
      text,
      mrkdwn: true,
    }),
  });
  const msgData = await msgRes.json() as any;
  if (!msgData.ok) { console.error("Failed to send:", msgData.error); return false; }
  return true;
}

async function main() {
  // 1. Send Rob a nudge
  console.log("Sending Rob a nudge...");
  const nudgeText = `Hey Rob! 👋 Quick follow-up — we're putting together the team's Flow Circuit map to figure out how to spread the work based on everyone's natural energy. Your input would really help us get the full picture.

It takes about 3 minutes: https://flowcircuit.manus.space/assessment

We're mapping out who naturally does what so we can reduce friction and stress across the team. Would love to have you in the mix!`;

  const sent = await sendSlackDM(ROB_SLACK_ID, nudgeText);
  console.log(sent ? "✅ Rob nudged successfully" : "❌ Failed to nudge Rob");

  // 2. Fix Kim and Josh affiliation types to "member"
  console.log("\nFixing Kim and Josh affiliation types...");
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection, { schema, mode: "default" });

  // Update Kim (assessment ID 360001) and Josh (assessment ID 450001) to member type
  await db.update(schema.teamAffiliations)
    .set({ affiliationType: "member" })
    .where(eq(schema.teamAffiliations.assessmentId, 360001));
  console.log("✅ Kim → member");

  await db.update(schema.teamAffiliations)
    .set({ affiliationType: "member" })
    .where(eq(schema.teamAffiliations.assessmentId, 450001));
  console.log("✅ Josh → member");

  // Also fix Darryl to "candidate" explicitly
  await db.update(schema.teamAffiliations)
    .set({ affiliationType: "candidate" })
    .where(eq(schema.teamAffiliations.assessmentId, 630001));
  console.log("✅ Darryl → candidate");

  // Verify
  const all = await db.select().from(schema.teamAffiliations).where(
    eq(schema.teamAffiliations.teamDomain, "ramprate.com")
  );
  console.log("\nUpdated affiliations:");
  all.forEach(a => console.log(`  ID: ${a.assessmentId} | Type: ${a.affiliationType}`));

  await connection.end();
}

main().catch(console.error);
