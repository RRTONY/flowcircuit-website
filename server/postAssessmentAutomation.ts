/**
 * Post-Assessment Automation
 * 
 * Runs asynchronously after each assessment submission:
 * 1. Auto-generates the individual PDF report
 * 2. Notifies the owner with the report link and key details
 * 3. Checks if the domain now has 3+ members → generates Team Friction Report
 * 4. Notifies the owner about the Team Friction Report if generated
 */

import { notifyOwner } from "./_core/notification";

interface AssessmentData {
  id: number;
  guestName: string;
  guestEmail: string | null;
  domain: string | null;
  role: string;
  score: number;
  scores: Record<string, number>;
  shareToken: string | null;
  teamId: number | null;
}

/**
 * Fire-and-forget automation after assessment submission.
 * Errors are caught and logged — they should never block the user's response.
 */
export async function runPostAssessmentAutomation(assessment: AssessmentData): Promise<void> {
  try {
    // ── Step 1: Auto-generate Individual PDF ──
    let pdfUrl: string | null = null;
    try {
      const { generateAssessmentPDF } = await import("./pdfReport");
      const result = await generateAssessmentPDF({
        name: assessment.guestName || "Anonymous",
        email: assessment.guestEmail || undefined,
        role: assessment.role,
        score: assessment.score ?? 0,
        scores: assessment.scores || {},
        shareToken: assessment.shareToken || undefined,
        assessmentId: assessment.id,
      });
      pdfUrl = result.url;
      console.log(`[Automation] PDF generated for ${assessment.guestName}: ${pdfUrl}`);
    } catch (err) {
      console.error("[Automation] Failed to generate individual PDF:", err);
    }

    // ── Step 2: Notify Owner about Individual Completion ──
    try {
      const scoreSummary = Object.entries(assessment.scores || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([role, score]) => `${role}: ${score}`)
        .join(" | ");

      const content = [
        `**${assessment.guestName}** just completed the Flow Circuit assessment.`,
        "",
        `**Dominant Role:** ${assessment.role}`,
        `**Score:** ${assessment.score}%`,
        `**Energy Split:** ${scoreSummary}`,
        assessment.domain ? `**Domain:** ${assessment.domain}` : null,
        assessment.guestEmail ? `**Email:** ${assessment.guestEmail}` : null,
        "",
        pdfUrl ? `**PDF Report:** ${pdfUrl}` : "PDF generation failed — user can still download from the results page.",
      ].filter(Boolean).join("\n");

      await notifyOwner({
        title: `New Assessment: ${assessment.guestName} is a ${assessment.role}`,
        content,
      });
      console.log(`[Automation] Owner notified about ${assessment.guestName}`);
    } catch (err) {
      console.error("[Automation] Failed to notify owner about individual:", err);
    }

    // ── Step 3: Check for Team Friction Report Trigger ──
    if (assessment.domain) {
      try {
        await checkAndGenerateTeamReport(assessment.domain, assessment.guestName);
      } catch (err) {
        console.error("[Automation] Failed to check/generate team report:", err);
      }
    }

    // ── Step 4: Check for Family Report Trigger ──
    if (assessment.domain && isFamilyDomain(assessment.domain)) {
      try {
        await checkAndGenerateFamilyReport(assessment.domain, assessment.guestName);
      } catch (err) {
        console.error("[Automation] Failed to check/generate family report:", err);
      }
    }
  } catch (err) {
    console.error("[Automation] Unexpected error in post-assessment automation:", err);
  }
}

/**
 * Check if a domain has 3+ assessments and generate a Team Friction Report.
 * Only generates if the team crossed the 3-member threshold with this submission,
 * OR if the team already has 3+ and a new member just joined (updated report).
 */
async function checkAndGenerateTeamReport(domain: string, triggerName: string): Promise<void> {
  const { getAssessmentsByDomain } = await import("./db");
  const domainAssessments = await getAssessmentsByDomain(domain);

  if (domainAssessments.length < 3) {
    console.log(`[Automation] ${domain} has ${domainAssessments.length} members — need 3+ for team report.`);
    return;
  }

  console.log(`[Automation] ${domain} has ${domainAssessments.length} members — generating Team Friction Report...`);

  const { generateTeamFrictionPDF } = await import("./teamFrictionReport");

  const members = domainAssessments.map(a => ({
    name: a.guestName || "Anonymous",
    role: a.role,
    score: a.score ?? 0,
    scores: (a.scores as Record<string, number>) || {},
  }));

  const teamName = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Team`;

  const result = await generateTeamFrictionPDF({
    teamName,
    domain,
    members,
  });

  console.log(`[Automation] Team Friction Report generated for ${domain}: ${result.url}`);

  // ── Step 4: Notify Owner about Team Report ──
  const roleCount: Record<string, number> = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });
  const missingRoles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"].filter(r => !roleCount[r]);

  const roleSummary = Object.entries(roleCount)
    .sort(([, a], [, b]) => b - a)
    .map(([role, count]) => `${role}: ${count}`)
    .join(" | ");

  const content = [
    `**Team Friction Report** generated for **${domain}** (triggered by ${triggerName} joining).`,
    "",
    `**Team Size:** ${members.length} members`,
    `**Role Distribution:** ${roleSummary}`,
    missingRoles.length > 0
      ? `**Missing Roles:** ${missingRoles.join(", ")} — the innovation relay breaks at ${missingRoles.length === 1 ? "this" : "these"} point${missingRoles.length > 1 ? "s" : ""}.`
      : "**Full Coverage** — all 5 relay positions are filled.",
    "",
    `**Team Report PDF:** ${result.url}`,
    "",
    `**Members:**`,
    ...members.map(m => `- ${m.name} (${m.role}, ${m.score}%)`),
  ].join("\n");

  await notifyOwner({
    title: `Team Report: ${domain} (${members.length} members${missingRoles.length > 0 ? `, missing ${missingRoles.join("/")}` : ", full coverage"})`,
    content,
  });

  console.log(`[Automation] Owner notified about team report for ${domain}`);
}

/**
 * Detect if a domain looks like a family group.
 * Family domains typically contain "family" or follow patterns like "the-smiths", "smith-family", etc.
 * Also matches domains that were created via the /family page (context=family in the URL).
 */
function isFamilyDomain(domain: string): boolean {
  const lower = domain.toLowerCase();
  // Explicit family indicators
  if (lower.includes("family")) return true;
  if (lower.startsWith("the-")) return true;
  // Domains that look like family names (no dots = not a company domain)
  if (!lower.includes(".") && lower.includes("-")) return true;
  // Short single-word domains without dots are likely family codes
  if (!lower.includes(".") && lower.length <= 20) return true;
  return false;
}

/**
 * Check if a family domain has 2+ assessments and generate a Family Energy Report.
 * Family reports trigger at 2 members (lower threshold than business teams).
 */
async function checkAndGenerateFamilyReport(domain: string, triggerName: string): Promise<void> {
  const { getAssessmentsByDomain } = await import("./db");
  const domainAssessments = await getAssessmentsByDomain(domain);

  if (domainAssessments.length < 2) {
    console.log(`[Automation] Family ${domain} has ${domainAssessments.length} members — need 2+ for family report.`);
    return;
  }

  console.log(`[Automation] Family ${domain} has ${domainAssessments.length} members — generating Family Energy Report...`);

  const { generateFamilyFrictionPDF } = await import("./familyFrictionReport");

  const members = domainAssessments.map(a => ({
    name: a.guestName || "Anonymous",
    role: a.role,
    score: a.score ?? 0,
    scores: (a.scores as Record<string, number>) || {},
  }));

  // Generate a nice family name from the domain
  const familyName = `The ${domain.charAt(0).toUpperCase() + domain.slice(1).replace(/-/g, ' ').replace(/family/i, '').trim()} Family`;

  const result = await generateFamilyFrictionPDF({
    familyName,
    domain,
    members,
  });

  console.log(`[Automation] Family Energy Report generated for ${domain}: ${result.url}`);

  // ── Notify Owner about Family Report ──
  const FAMILY_ROLE_NAMES: Record<string, string> = {
    Spark: "Dreamer",
    Amplifier: "Cheerleader",
    Filter: "Protector",
    Ground: "Rock",
    Conductor: "Peacemaker",
  };

  const roleCount: Record<string, number> = {};
  members.forEach(m => { roleCount[m.role] = (roleCount[m.role] || 0) + 1; });
  const missingRoles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"].filter(r => !roleCount[r]);

  const roleSummary = Object.entries(roleCount)
    .sort(([, a], [, b]) => b - a)
    .map(([role, count]) => `${FAMILY_ROLE_NAMES[role] || role}: ${count}`)
    .join(" | ");

  const content = [
    `**Family Energy Report** generated for **${familyName}** (triggered by ${triggerName} joining).`,
    "",
    `**Family Size:** ${members.length} members`,
    `**Energy Distribution:** ${roleSummary}`,
    missingRoles.length > 0
      ? `**Shared Energies:** ${missingRoles.map(r => FAMILY_ROLE_NAMES[r] || r).join(", ")} — ${missingRoles.length === 1 ? "this energy is" : "these energies are"} being absorbed by others.`
      : "**Full Coverage** — all 5 family energies have a natural owner.",
    "",
    `**Family Report PDF:** ${result.url}`,
    "",
    `**Members:**`,
    ...members.map(m => `- ${m.name} (${FAMILY_ROLE_NAMES[m.role] || m.role}, ${m.score}%)`),
  ].join("\n");

  await notifyOwner({
    title: `Family Report: ${familyName} (${members.length} members${missingRoles.length > 0 ? `, ${missingRoles.length} shared` : ", full coverage"})`,
    content,
  });

  console.log(`[Automation] Owner notified about family report for ${domain}`);
}
