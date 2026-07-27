import type { Metadata } from "next";
import ManagerGuidebookClient from "./ManagerGuidebookClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Team Captain's Protocol | The Flow Circuit",
  description:
    "Create your team, get a single invite link, and send ready-made Slack and email templates so your whole team can take The Flow Circuit assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/manager-guidebook" },
};

export default function ManagerGuidebookPage() {
  return (
    <ClientOnly>
      <ManagerGuidebookClient />
    </ClientOnly>
  );
}
