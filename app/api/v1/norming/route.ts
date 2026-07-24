import { validateApiKey } from "@/server/_core/apiKeyAuth";
import { getNormingData } from "@/server/db";

export async function GET(req: Request) {
  const unauthorized = validateApiKey(req);
  if (unauthorized) return unauthorized;

  try {
    const data = await getNormingData();
    return Response.json(data);
  } catch (error: any) {
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
