import type { Metadata } from "next";
import EfficacyReportClient from "./EfficacyReportClient";

export const metadata: Metadata = {
  title: "Efficacy Report | The Flow Circuit",
  description:
    "Does Deep Calibration actually work? A Monte Carlo simulation of 10,000 synthetic respondents measuring classification accuracy, test-retest reliability, faking resistance, and role distribution bias — full methodology and limitations disclosed.",
  alternates: { canonical: "https://flow.tonygreenberg.com/efficacy" },
};

export default function Page() {
  return <EfficacyReportClient />;
}
