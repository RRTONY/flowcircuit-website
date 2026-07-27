import type { Metadata } from "next";
import WhyTeamsFailClient from "./WhyTeamsFailClient";

export const metadata: Metadata = {
  title: "Why Teams Fail | Four Circuit Failure Patterns",
  description:
    "It's never about talent. Diagnose the four team circuit failures — the All-Spark Team, the Ghost Circuit, the Trust Deficit, and the Filter Trap — and learn the fix for each.",
  alternates: { canonical: "https://flow.tonygreenberg.com/why-teams-fail" },
};

export default function Page() {
  return <WhyTeamsFailClient />;
}
