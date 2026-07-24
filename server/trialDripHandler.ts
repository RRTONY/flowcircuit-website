/**
 * Trial Email Drip Handler
 * Runs daily via Heartbeat cron. Checks all active trials and sends
 * the appropriate email based on days since trial start.
 *
 * Schedule: Day 0 (welcome), Day 3 (nudge 360), Day 7 (team value),
 *           Day 25 (conversion warning), Day 30 (trial ended)
 */
import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { sendEmail } from "./emailService";
import { getDb } from "./db";
import { tribeTrials } from "../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

// ── Email Templates ──────────────────────────────────────────────

interface DripEmail {
  subject: string;
  body: string;
}

function getDripEmail(day: number, name: string, trialEmail: string): DripEmail | null {
  const firstName = name.split(" ")[0] || "there";

  switch (day) {
    case 0:
      return {
        subject: `Welcome to Flow Circuit, ${firstName} — your 30-day Tribe trial is live`,
        body: `Hey ${firstName},

Your Tribe trial is now active. Here's what you can do right now:

1. INVITE YOUR TEAM — Send your unique assessment link to 3–10 colleagues. They take the same 2-minute assessment you did.

2. LAUNCH YOUR 360 — From your results page, open "My 360" and copy your reviewer link. Send it to 3–5 people who see you in action.

3. WATCH THE MAP BUILD — As your team completes assessments, your Team Energy Map populates automatically. You'll see friction pairs, missing roles, and handoff gaps in real time.

Your trial includes:
• Full team dashboard with friction pair detection
• 360 Peer Review with gap radar
• Individual playbooks for every team member
• Up to 10 team members

No credit card on file. Converts to $29/member/month on day 31 only if you choose to continue.

One thing to do today: send the assessment link to at least 3 people.

— The Flow Circuit`
      };

    case 3:
      return {
        subject: `${firstName}, have you sent your 360 link yet?`,
        body: `Hey ${firstName},

Quick check-in. The single highest-value action in your trial is getting 3 people to complete your 360 review.

Here's why: Your self-assessment captures intention. Your peers capture impact. The gap between them is where the real insight lives.

What to do right now:
1. Go to your results page → open "My 360"
2. Copy your unique reviewer link
3. Text or Slack it to 3 people with this message:

"Hey — I just took a 2-minute assessment to understand my natural role in team innovation. Would you take a quick 360 review to help me see the gap between how I see myself and how you experience me? Here's the link: [your link]"

The 360 takes reviewers about 90 seconds. Your gap report unlocks at 3 responses.

— The Flow Circuit`
      };

    case 7:
      return {
        subject: `Your team's friction map is waiting, ${firstName}`,
        body: `Hey ${firstName},

One week in. Here's what most teams discover by now:

• The person they thought was "difficult" is actually a Filter doing exactly what the team needs — stress-testing ideas before they ship broken.

• The person who "never finishes anything" is a Spark — they're not supposed to finish. They're supposed to hand off to an Amplifier.

• The role nobody is playing (usually Conductor) is the reason meetings feel circular.

If you have 3+ team members who've completed the assessment, your Team Energy Map is already live. Go to /team-map?domain=yourdomain.com to see:

→ Which friction pairs are burning energy
→ Which relay stage has no one covering it
→ Who your best internal candidate is for the missing role

If you haven't hit 3 team members yet — today's the day. Send the assessment link to your team. It takes 2 minutes.

— The Flow Circuit`
      };

    case 25:
      return {
        subject: `5 days left on your Tribe trial, ${firstName}`,
        body: `Hey ${firstName},

Your 30-day Tribe trial ends in 5 days.

Here's what you keep either way:
✓ Your individual Flow Circuit report (forever free)
✓ Your 360 gap data (if you collected it)
✓ Your team's assessment results

Here's what goes away on day 31:
✗ Team Energy Map and friction pair detection
✗ Manager guidebook and individual playbooks
✗ 360 Peer Review link generation
✗ Weekly team health reports

The math: One wasted meeting with 10 people costs ~$1,200. The Tribe plan for 10 people costs $290/month. It pays for itself the first time a role-misfit handoff doesn't happen.

To continue: go to /pricing and subscribe before day 30. Your team data carries over seamlessly.

To cancel: do nothing. Your trial ends automatically. No charge.

— The Flow Circuit`
      };

    case 30:
      return {
        subject: `Your Tribe trial has ended, ${firstName}`,
        body: `Hey ${firstName},

Your 30-day Tribe trial ended today.

Your individual report and 360 data are still yours — they live at your results page permanently.

Team features (friction map, playbooks, team reports) are now paused. Your data isn't deleted — if you subscribe later, everything reactivates instantly.

If the timing wasn't right, no hard feelings. The individual assessment is always free, and your team members keep their reports too.

If you want to reactivate: /pricing → Start Tribe → your existing team data loads immediately.

Thanks for trying Flow Circuit.

— The Flow Circuit`
      };

    default:
      return null;
  }
}

// ── Handler ──────────────────────────────────────────────────────

export async function trialDripHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    // Get all active trials
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const activeTrials = await db
      .select()
      .from(tribeTrials)
      .where(eq(tribeTrials.status, "active"));

    const now = Date.now();
    const DAY_MS = 86400000;
    let emailsSent = 0;
    let trialsExpired = 0;

    for (const trial of activeTrials) {
      const daysSinceStart = Math.floor((now - trial.startedAt.getTime()) / DAY_MS);

      // Check if trial has expired
      if (daysSinceStart >= 30) {
        await db
          .update(tribeTrials)
          .set({ status: "expired" })
          .where(eq(tribeTrials.id, trial.id));
        trialsExpired++;
      }

      // Check if we should send an email today
      const email = getDripEmail(daysSinceStart, trial.name, trial.email);
      if (!email) continue;

      // Check if we already sent this day's email (using lastDripDay field)
      if (trial.lastDripDay !== null && trial.lastDripDay >= daysSinceStart) continue;

      // Send email to the trial participant (Resend if configured, owner notification fallback)
      const sent = await sendEmail({
        to: trial.email,
        subject: email.subject,
        text: email.body,
      });

      if (!sent) {
        console.warn(`[TrialDrip] Failed to send Day ${daysSinceStart} email to ${trial.email}`);
        continue; // Don't update lastDripDay so we retry next run
      }

      // Update lastDripDay
      await db
        .update(tribeTrials)
        .set({ lastDripDay: daysSinceStart })
        .where(eq(tribeTrials.id, trial.id));

      emailsSent++;
    }

    res.json({
      ok: true,
      processed: activeTrials.length,
      emailsSent,
      trialsExpired,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[TrialDrip] Error:", error);
    res.status(500).json({
      error: error.message || "Unknown error",
      stack: error.stack,
      context: { url: req.url, taskUid: (error as any)?.taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}
