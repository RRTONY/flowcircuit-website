import type { Metadata } from "next";
import ShareResultsClient from "./ShareResultsClient";

export const metadata: Metadata = {
  title: "Shared Assessment Result | The Flow Circuit",
  description:
    "View a shared Flow Circuit assessment result — see the role, energy distribution, and personalized report for this shared link.",
  alternates: { canonical: "https://flow.tonygreenberg.com/share" },
};

export default function SharePage() {
  return <ShareResultsClient />;
}
