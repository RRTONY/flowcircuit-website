import { validateApiKey } from "@/server/_core/apiKeyAuth";
import { getTeamById, getAssessmentsByTeam } from "@/server/db";

export async function GET(req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const unauthorized = validateApiKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { teamId } = await params;
    const team = await getTeamById(parseInt(teamId));
    if (!team) return Response.json({ error: "Team not found" }, { status: 404 });
    const assessments = await getAssessmentsByTeam(team.id);
    return Response.json({ team, assessments });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
