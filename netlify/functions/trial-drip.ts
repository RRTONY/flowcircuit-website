import type { Config } from "@netlify/functions";
import { runTrialDrip } from "../../server/trialDripHandler";

// Daily 9:00 AM UTC — matches the schedule previously registered with
// Manus's heartbeat cron (task UID 8CRERhCH3kfCPuuwnjsqbP).
export const config: Config = {
  schedule: "0 9 * * *",
};

export default async () => {
  const result = await runTrialDrip();
  return new Response(JSON.stringify(result), { headers: { "content-type": "application/json" } });
};
