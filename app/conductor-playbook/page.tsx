import type { Metadata } from "next";
import ConductorPlaybookClient from "./ConductorPlaybookClient";

export const metadata: Metadata = {
  title: "The Conductor's Playbook — Rules for Orchestrating Introductions",
  description:
    "A 7-step interactive playbook for the Conductor role: the Mind Meld, the Audit, the Friendly Guidance, the Social Impact Check, and more — the rules for making introductions that actually multiply.",
  alternates: { canonical: "https://flow.tonygreenberg.com/conductor-playbook" },
};

export default function Page() {
  return <ConductorPlaybookClient />;
}
