import type { Metadata } from "next";
import DeepCalibrationClient from "./DeepCalibrationClient";

export const metadata: Metadata = {
  title: "Deep Calibration | The Flow Circuit",
  description:
    "Go beyond the standard assessment with Deep Calibration — a forced-ranking, ipsative-scored exercise that verifies your Flow Circuit role and earns you a Verified badge.",
  alternates: { canonical: "https://flow.tonygreenberg.com/deep-calibration" },
};

export default function Page() {
  return <DeepCalibrationClient />;
}
