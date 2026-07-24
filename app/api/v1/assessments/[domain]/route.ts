import { validateApiKey } from "@/server/_core/apiKeyAuth";
import { getAssessmentsByDomain } from "@/server/db";

export async function GET(req: Request, { params }: { params: Promise<{ domain: string }> }) {
  const unauthorized = validateApiKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { domain } = await params;
    const assessments = await getAssessmentsByDomain(domain);
    return Response.json({ assessments });
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
