import type { Metadata } from "next";
import AdminDashboardClient from "./AdminDashboardClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Admin Dashboard | The Flow Circuit",
  description:
    "Internal admin dashboard for Flow Circuit adoption metrics, team management, and email drip campaigns. Admin access required.",
  alternates: { canonical: "https://flow.tonygreenberg.com/admin" },
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <ClientOnly>
      <AdminDashboardClient />
    </ClientOnly>
  );
}
