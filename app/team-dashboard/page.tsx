import type { Metadata } from "next";
import TeamDashboardClient from "./TeamDashboardClient";

export const metadata: Metadata = {
  title: "Team Dashboard | The Flow Circuit",
  description:
    "Circuit Command: your team's live Energy Matrix, role distribution, friction points, and hiring gaps, mapped from every completed Flow Circuit assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/team-dashboard" },
};

export default function TeamDashboardPage() {
  return <TeamDashboardClient />;
}
