import type { Metadata } from "next";
import ReportsDashboardClient from "./ReportsDashboardClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Reports Dashboard | The Flow Circuit",
  description:
    "Admin dashboard for The Flow Circuit — browse individual assessment reports, filter by domain and role, and generate individual or team PDF reports.",
  alternates: { canonical: "https://flow.tonygreenberg.com/reports" },
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <ClientOnly>
      <ReportsDashboardClient />
    </ClientOnly>
  );
}
