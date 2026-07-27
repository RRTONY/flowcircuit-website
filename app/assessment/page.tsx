import type { Metadata } from "next";
import AssessmentClient from "./AssessmentClient";

export const metadata: Metadata = {
  title: "Take the Assessment | The Flow Circuit",
  description:
    "12 forced-rank questions, about 8 minutes. Discover whether you're a Spark, Amplifier, Filter, Ground, or Conductor — your natural energy role on any team.",
  alternates: { canonical: "https://flow.tonygreenberg.com/assessment" },
};

export default function Page() {
  return <AssessmentClient />;
}
