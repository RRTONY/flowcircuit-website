import type { Metadata } from "next";
import AlignmentResultsClient from "./AlignmentResultsClient";

export const metadata: Metadata = {
  title: "Your Flow Circuit Results | The Flow Circuit",
  description:
    "Your personalized Flow Circuit report — dominant energy role, energy distribution, stress zones, deep analysis, and team dynamics based on your 12-question assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/results" },
};

export default function Page() {
  return <AlignmentResultsClient />;
}
