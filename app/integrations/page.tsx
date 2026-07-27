import type { Metadata } from "next";
import IntegrationsClient from "./IntegrationsClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Slack & Teams Integrations | The Flow Circuit",
  description:
    "Connect The Flow Circuit to Slack or Microsoft Teams for real-time role alerts. Get notified with role, combination profile, and stress warnings the moment a teammate completes their assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/integrations" },
};

export default function Page() {
  return (
    <ClientOnly>
      <IntegrationsClient />
    </ClientOnly>
  );
}
