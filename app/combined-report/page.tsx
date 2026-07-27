import type { Metadata } from "next";
import CombinedReportClient from "./CombinedReportClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "The Combined Report — Flow Circuit DNA + SoulPrint",
  description:
    "Merge your Flow Circuit team DNA with your TrueSelf SoulPrint blueprint. A 12,000-word AI-synthesized report covering your convergence analysis, resistance map, and integration path.",
  alternates: { canonical: "https://flow.tonygreenberg.com/combined-report" },
};

export default function Page() {
  return (
    <ClientOnly>
      <CombinedReportClient />
    </ClientOnly>
  );
}
