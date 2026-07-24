/**
 * Send introductory Flow Circuit email to msinel@mac.com
 * Since Resend isn't configured, this goes through notifyOwner
 * so Tony can forward it (or we send directly if Resend is live).
 */

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

const recipient = "msinel@mac.com";
const subject = "Your Team's Flow Circuit — 10 People, 5 Minutes Each, One Map That Changes Everything";

const body = `Hey —

I want to share something with you that I've been building. It's called Flow Circuit, and it's designed for exactly what you're dealing with: a 10-person team where some people clash, some people carry, and nobody quite knows why.

Here's the premise: every team runs on 5 energy roles — Spark (ideas), Amplifier (momentum), Filter (quality), Ground (execution), and Conductor (orchestration). Most teams have too many of one and zero of another. That imbalance is where friction lives.

HERE'S HOW TO USE IT WITH YOUR TEAM (15 minutes total setup):

STEP 1: Take the assessment yourself (5 minutes)
→ https://flowcircuit.manus.space/assessment

It's 12 forced-rank questions. No right answers — you're just sorting preferences. At the end you'll see your dominant role, your energy distribution across all 5 roles, and a PDF report you can download or share.

STEP 2: Send the same link to your team
→ Same URL: https://flowcircuit.manus.space/assessment

Each person enters their work email. The system auto-detects they're on the same team by domain. As people complete it, your Team Energy Map builds itself automatically.

STEP 3: Watch the map populate
Once 3+ people from your domain complete the assessment, the system auto-generates a Team Friction Report showing:
• Which roles you have covered (and who fills them)
• Which roles are MISSING (this is usually the breakthrough insight)
• Where friction pairs exist (e.g., two Sparks competing, or a Filter blocking a Spark)
• Specific handoff recommendations for your team

STEP 4: Launch your 360 (optional, powerful)
After you see your results, you can generate a "360 Review Link" — send it to 3–5 people who work with you. They rank how THEY see your energy. The gap between self-perception and peer-perception is where the real growth lives.

WHAT YOU'LL LEARN:
• Why certain 1:1s feel like pulling teeth (friction pairs)
• Why some projects stall at the same phase every time (missing roles)
• Who on your team is carrying energy they shouldn't be (misalignment)
• What to hire for next (the gap in your circuit)

It's free. No credit card. Takes 5 minutes per person.

Start here: https://flowcircuit.manus.space/assessment

Once your team is mapped, I'll walk you through the results if you want — or the report speaks for itself.

— Tony

P.S. The most common reaction after a team sees their map: "Oh. THAT'S why that keeps happening."`;

async function sendEmail() {
  try {
    const response = await fetch(`${FORGE_API_URL}/notification/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        title: `📧 Email to send → ${recipient}`,
        content: `RECIPIENT: ${recipient}\nSUBJECT: ${subject}\n\n${body}`,
      }),
    });

    const data = await response.json();
    console.log("Notification sent:", JSON.stringify(data, null, 2));
    console.log("\n---");
    console.log("EMAIL READY TO FORWARD:");
    console.log("TO:", recipient);
    console.log("SUBJECT:", subject);
    console.log("---");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

sendEmail();
