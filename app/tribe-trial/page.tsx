import type { Metadata } from "next";
import TribeTrialClient from "./TribeTrialClient";

export const metadata: Metadata = {
  title: "Start Your 30-Day Tribe Trial | The Flow Circuit",
  description:
    "Get full Tribe access free for 30 days — 360 peer review, friction pair detection, team energy maps, and the manager guidebook for up to 10 team members. No credit card required.",
  alternates: { canonical: "https://flow.tonygreenberg.com/tribe-trial" },
};

export default function Page() {
  return <TribeTrialClient />;
}
