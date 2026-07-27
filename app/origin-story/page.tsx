import type { Metadata } from "next";
import OriginStoryClient from "./OriginStoryClient";

export const metadata: Metadata = {
  title: "Origin Story | From the Z Process to The Flow Circuit",
  description:
    "25 years in the making. The timeline from Tony Greenberg's RampRate days and the Al Fahden Team Dimensions discovery through Harvard, Davos, and the 2025 launch of The Flow Circuit.",
  alternates: { canonical: "https://flow.tonygreenberg.com/origin-story" },
};

export default function Page() {
  return <OriginStoryClient />;
}
