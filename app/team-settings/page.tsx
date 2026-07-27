import type { Metadata } from "next";
import TeamSettingsClient from "./TeamSettingsClient";

export const metadata: Metadata = {
  title: "Team Settings | The Flow Circuit",
  description:
    "Configure your team's Flow Circuit — branding, logo, Slack integration, and weekly energy report notifications.",
  alternates: { canonical: "https://flow.tonygreenberg.com/team-settings" },
};

export default function TeamSettingsPage() {
  return <TeamSettingsClient />;
}
