import type { Metadata } from "next";
import SampleReportsClient from "./SampleReportsClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Sample Reports | The Flow Circuit",
  description:
    "Preview a real Tribe Energy Map: team scatter plot, named friction pairs, individual playbooks, and hiring recommendations from The Flow Circuit assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/sample-reports" },
};

export default function SampleReportsPage() {
  return (
    <ClientOnly>
      <SampleReportsClient />
    </ClientOnly>
  );
}
