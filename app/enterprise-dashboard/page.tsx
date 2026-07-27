import type { Metadata } from "next";
import EnterpriseDashboardClient from "./EnterpriseDashboardClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Circuit Health Dashboard — Enterprise Team View",
  description:
    "See your team's full Flow Circuit role composition at a glance — circuit health score, role distribution, gaps, and strengths, with optimization recommendations for enterprise teams.",
  alternates: { canonical: "https://flow.tonygreenberg.com/enterprise-dashboard" },
};

export default function Page() {
  return (
    <ClientOnly>
      <EnterpriseDashboardClient />
    </ClientOnly>
  );
}
