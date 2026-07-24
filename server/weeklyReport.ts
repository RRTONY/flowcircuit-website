import "server-only";
import { getDb } from "./db";
import { teams, assessments, feedback } from "../drizzle/schema";
import { eq, gte, and, desc, count } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendSlackNotification } from "./db";

/**
 * Weekly Report Generator
 * Compiles team activity from the past 7 days and sends a summary
 * via the Manus notification system and optionally via Slack.
 */

interface TeamWeeklySummary {
  teamId: number;
  teamName: string;
  companyName: string | null;
  newAssessments: number;
  totalMembers: number;
  roleDistribution: Record<string, number>;
  avgScore: number;
  feedbackCount: number;
  avgAccuracy: number | null;
  slackWebhookUrl: string | null;
}

async function getWeeklyData(): Promise<TeamWeeklySummary[]> {
  const db = await getDb();
  if (!db) return [];

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all teams with weekly reports enabled
  const allTeams = await db.select().from(teams).where(eq(teams.weeklyReportEnabled, true));

  const summaries: TeamWeeklySummary[] = [];

  for (const team of allTeams) {
    // Get new assessments this week
    const newAssessmentRows = await db
      .select()
      .from(assessments)
      .where(and(eq(assessments.teamId, team.id), gte(assessments.createdAt, oneWeekAgo)));

    // Get total members
    const allMembers = await db
      .select()
      .from(assessments)
      .where(eq(assessments.teamId, team.id));

    // Calculate role distribution
    const roleDistribution: Record<string, number> = {};
    for (const member of allMembers) {
      roleDistribution[member.role] = (roleDistribution[member.role] || 0) + 1;
    }

    // Calculate average score
    const avgScore = allMembers.length > 0
      ? Math.round(allMembers.reduce((sum, m) => sum + m.score, 0) / allMembers.length)
      : 0;

    // Get feedback this week
    const weekFeedback = await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.teamId, team.id), gte(feedback.createdAt, oneWeekAgo)));

    // Calculate average accuracy rating
    const accuracyRatings = weekFeedback
      .filter(f => f.accuracyRating !== null)
      .map(f => f.accuracyRating!);
    const avgAccuracy = accuracyRatings.length > 0
      ? Math.round((accuracyRatings.reduce((sum, r) => sum + r, 0) / accuracyRatings.length) * 10) / 10
      : null;

    summaries.push({
      teamId: team.id,
      teamName: team.name,
      companyName: team.companyName,
      newAssessments: newAssessmentRows.length,
      totalMembers: allMembers.length,
      roleDistribution,
      avgScore,
      feedbackCount: weekFeedback.length,
      avgAccuracy,
      slackWebhookUrl: team.slackWebhookUrl,
    });
  }

  return summaries;
}

function formatWeeklyReport(summaries: TeamWeeklySummary[]): string {
  if (summaries.length === 0) {
    return "No teams with weekly reports enabled this week.";
  }

  const lines: string[] = [
    "# Weekly Energy Shift Report",
    `**Period:** ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
    "",
    `**Active Teams:** ${summaries.length}`,
    `**Total New Assessments:** ${summaries.reduce((s, t) => s + t.newAssessments, 0)}`,
    `**Total Feedback Received:** ${summaries.reduce((s, t) => s + t.feedbackCount, 0)}`,
    "",
    "---",
    "",
  ];

  for (const team of summaries) {
    lines.push(`## ${team.teamName}${team.companyName ? ` (${team.companyName})` : ""}`);
    lines.push("");
    lines.push(`- **New Completions This Week:** ${team.newAssessments}`);
    lines.push(`- **Total Team Members:** ${team.totalMembers}`);
    lines.push(`- **Average Score:** ${team.avgScore}%`);
    
    if (Object.keys(team.roleDistribution).length > 0) {
      lines.push(`- **Role Distribution:** ${Object.entries(team.roleDistribution).map(([role, count]) => `${role}: ${count}`).join(", ")}`);
    }

    if (team.avgAccuracy !== null) {
      lines.push(`- **Accuracy Rating:** ${team.avgAccuracy}/5`);
    }

    // Gap analysis
    const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
    const missingRoles = roles.filter(r => !team.roleDistribution[r]);
    if (missingRoles.length > 0) {
      lines.push(`- **Missing Roles:** ${missingRoles.join(", ")} (consider hiring for these gaps)`);
    }

    const heavyRoles = Object.entries(team.roleDistribution).filter(([_, c]) => c >= 3);
    if (heavyRoles.length > 0) {
      lines.push(`- **Over-Represented:** ${heavyRoles.map(([r, c]) => `${r} (${c})`).join(", ")}`);
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

function formatSlackWeeklyReport(summary: TeamWeeklySummary): object {
  const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"];
  const missingRoles = roles.filter(r => !summary.roleDistribution[r]);
  
  return {
    text: `Weekly Energy Shift Report - ${summary.teamName}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `Weekly Energy Shift: ${summary.teamName}` },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            `*New Completions:* ${summary.newAssessments}`,
            `*Total Members:* ${summary.totalMembers}`,
            `*Avg Score:* ${summary.avgScore}%`,
            summary.avgAccuracy ? `*Accuracy Rating:* ${summary.avgAccuracy}/5` : null,
            Object.keys(summary.roleDistribution).length > 0
              ? `*Roles:* ${Object.entries(summary.roleDistribution).map(([r, c]) => `${r}: ${c}`).join(" | ")}`
              : null,
            missingRoles.length > 0
              ? `*Missing:* ${missingRoles.join(", ")}`
              : null,
          ].filter(Boolean).join("\n"),
        },
      },
    ],
  };
}

export async function runWeeklyReport(): Promise<void> {
  console.log("[WeeklyReport] Starting weekly report generation...");

  try {
    const summaries = await getWeeklyData();

    // Send owner notification with full report
    const reportContent = formatWeeklyReport(summaries);
    await notifyOwner({
      title: "Weekly Energy Shift Report",
      content: reportContent,
    });

    // Send Slack notifications for teams with webhooks
    for (const summary of summaries) {
      if (summary.slackWebhookUrl) {
        const slackPayload = formatSlackWeeklyReport(summary);
        await sendSlackNotification(summary.slackWebhookUrl, slackPayload as any);
      }
    }

    console.log(`[WeeklyReport] Report sent for ${summaries.length} teams.`);
  } catch (error) {
    console.error("[WeeklyReport] Failed to generate weekly report:", error);
  }
}
