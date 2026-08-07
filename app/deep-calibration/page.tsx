import type { Metadata } from "next";
import DeepCalibrationClient from "./DeepCalibrationClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Deep Calibration | The Flow Circuit",
  description:
    "Go beyond the standard assessment with Deep Calibration — a forced-ranking, ipsative-scored exercise that gives you a more differentiated read on your Flow Circuit role and earns you a Calibrated badge.",
  alternates: { canonical: "https://flow.tonygreenberg.com/deep-calibration" },
};

export default function Page() {
  return (
    <ClientOnly>
      <DeepCalibrationClient />
    </ClientOnly>
  );
}
