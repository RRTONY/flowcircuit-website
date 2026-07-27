import type { Metadata } from "next";
import InvestorMetricsClient from "./InvestorMetricsClient";

export const metadata: Metadata = {
  title: "Investor Metrics Dashboard | The Flow Circuit",
  description:
    "Aggregate platform data showing adoption velocity, engagement depth, and market validation signals for The Flow Circuit. Admin-only, screenshot-ready for pitch decks.",
  alternates: { canonical: "https://flow.tonygreenberg.com/investor-metrics" },
};

export default function Page() {
  return <InvestorMetricsClient />;
}
