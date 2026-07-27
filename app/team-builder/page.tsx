import type { Metadata } from "next";
import TeamBuilderClient from "./TeamBuilderClient";

export const metadata: Metadata = {
  title: "Team Architecture | The Flow Circuit",
  description:
    "Map your innovation relay. Take the 12-question assessment individually or join with a team code, then view your team's Energy Matrix and sample reports.",
  alternates: { canonical: "https://flow.tonygreenberg.com/team-builder" },
};

export default function TeamBuilderPage() {
  return <TeamBuilderClient />;
}
