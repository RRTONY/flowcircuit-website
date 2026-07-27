import type { Metadata } from "next";
import ThreeSixtyResultsClient from "./ThreeSixtyResultsClient";

export const metadata: Metadata = {
  title: "360 Gap Report | The Flow Circuit",
  description: "How you see yourself vs. how others experience you — your self vs. peer perception gap report.",
};

export default async function Page({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params;
  return <ThreeSixtyResultsClient assessmentId={assessmentId} />;
}
