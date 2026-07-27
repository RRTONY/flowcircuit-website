import type { Metadata } from "next";
import TeamMapPageClient from "./TeamMapPageClient";

export const metadata: Metadata = {
  title: "Tribe Energy Map | The Flow Circuit",
  description:
    "See how your team's energy flows. Map every teammate's Flow Circuit role, spot friction pairs, and find the gaps holding your tribe back.",
  alternates: { canonical: "https://flow.tonygreenberg.com/team-map" },
};

export default function TeamMapPage() {
  return <TeamMapPageClient />;
}
