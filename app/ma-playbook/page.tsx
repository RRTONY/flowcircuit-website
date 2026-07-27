import type { Metadata } from "next";
import MAPlaybookClient from "./MAPlaybookClient";

export const metadata: Metadata = {
  title: "The M&A Integration Playbook — Flow Circuit for Mergers",
  description:
    "A 3-phase playbook for merging organizational circuits during M&A — pre-deal due diligence, the Day 1-90 nervous system merge, and the Day 90-365 culture circuit, plus common anti-patterns to avoid.",
  alternates: { canonical: "https://flow.tonygreenberg.com/ma-playbook" },
};

export default function Page() {
  return <MAPlaybookClient />;
}
