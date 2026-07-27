import type { Metadata } from "next";
import TeamComparisonClient from "./TeamComparisonClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Team Comparison | The Flow Circuit",
  description:
    "Side-by-side Flow Circuit analysis for two teams — see where energy profiles align, where they clash, and what gaps a merger or integration would fill.",
  alternates: { canonical: "https://flow.tonygreenberg.com/team-comparison" },
};

export default function TeamComparisonPage() {
  return (
    <ClientOnly>
      <TeamComparisonClient />
    </ClientOnly>
  );
}
