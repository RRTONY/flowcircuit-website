import { validateApiKey } from "@/server/_core/apiKeyAuth";
import { saveAssessment, getOrCreateTeamByDomain } from "@/server/db";

export async function POST(req: Request) {
  const unauthorized = validateApiKey(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const { guestName, guestEmail, domain, role, score, scores, answers } = body;
    if (!guestName || !role || score === undefined) {
      return Response.json({ error: "Required fields: guestName, role, score" }, { status: 400 });
    }

    let teamId: number | null = null;
    if (domain) {
      const team = await getOrCreateTeamByDomain(domain);
      teamId = team?.id ?? null;
    }

    const shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const assessment = await saveAssessment({
      guestName,
      guestEmail: guestEmail || null,
      domain: domain || null,
      role,
      score,
      scores: scores || {},
      answers: answers || {},
      teamId,
      userId: null,
      shareToken,
    });

    // Fire-and-forget: auto-generate PDF, notify owner, check team friction report
    if (assessment) {
      import("@/server/postAssessmentAutomation")
        .then(({ runPostAssessmentAutomation }) =>
          runPostAssessmentAutomation({
            id: assessment.id,
            guestName: assessment.guestName || guestName,
            guestEmail: assessment.guestEmail || guestEmail || null,
            domain: domain || null,
            role: assessment.role || role,
            score: assessment.score ?? score,
            scores: (assessment.scores as Record<string, number>) || scores || {},
            shareToken: assessment.shareToken || null,
            teamId: assessment.teamId || null,
          })
        )
        .catch((err: any) => console.error("[PostAssessment] REST automation failed:", err));
    }

    return Response.json({ success: true, assessment });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
