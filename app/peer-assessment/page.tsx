import type { Metadata } from "next";
import PeerAssessmentClient from "./PeerAssessmentClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "360° Peer Review | The Flow Circuit",
  description: "Answer 12 questions about how a colleague actually shows up in the work, and help them see their perception gap.",
  alternates: { canonical: "https://flow.tonygreenberg.com/peer-assessment" },
};

export default function Page() {
  return (
    <ClientOnly>
      <PeerAssessmentClient />
    </ClientOnly>
  );
}
