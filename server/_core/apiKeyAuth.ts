import "server-only";
import { ENV } from "./env";

/**
 * Validates the Enterprise API v1 key from either the x-api-key header or a
 * Bearer token. Returns a Response to short-circuit with if invalid, or null
 * if the request is authorized.
 */
export function validateApiKey(req: Request): Response | null {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKey) {
    return Response.json(
      { error: "API key required. Pass via x-api-key header or Bearer token." },
      { status: 401 }
    );
  }

  if (!ENV.enterpriseApiKey || apiKey !== ENV.enterpriseApiKey) {
    return Response.json({ error: "Invalid API key." }, { status: 403 });
  }

  return null;
}
