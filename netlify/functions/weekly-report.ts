import type { Config } from "@netlify/functions";
import { runWeeklyReport } from "../../server/weeklyReport";

// Monday 9:00 AM UTC — matches the schedule previously registered with
// Manus's heartbeat cron.
export const config: Config = {
  schedule: "0 9 * * 1",
};

export default async () => {
  await runWeeklyReport();
  return new Response("ok");
};
