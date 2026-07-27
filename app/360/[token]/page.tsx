import type { Metadata } from "next";
import ThreeSixtyReviewClient from "./ThreeSixtyReviewClient";

export const metadata: Metadata = {
  title: "360 Peer Review | The Flow Circuit",
  description: "Rank how a colleague shows up across the five Flow Circuit energy types — anonymous, aggregated peer feedback.",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <ThreeSixtyReviewClient token={token} />;
}
