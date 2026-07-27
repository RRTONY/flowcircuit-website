import type { Metadata } from "next";
import PeerAssessmentClient from "@/app/peer-assessment/PeerAssessmentClient";

export const metadata: Metadata = {
  title: "360° Peer Review | The Flow Circuit",
  description: "Answer 12 questions about how a colleague actually shows up in the work, and help them see their perception gap.",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PeerAssessmentClient token={token} />;
}
