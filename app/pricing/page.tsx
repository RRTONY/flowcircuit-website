import type { Metadata } from "next";
import PricingClient from "./PricingClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Pricing | The Flow Circuit",
  description:
    "Individual discovery is free. Team intelligence is where the real ROI lives. Compare Explorer, Tribe, and Enterprise plans for Flow Circuit team mapping.",
  alternates: { canonical: "https://flow.tonygreenberg.com/pricing" },
};

export default function PricingPage() {
  return (
    <ClientOnly>
      <PricingClient />
    </ClientOnly>
  );
}
