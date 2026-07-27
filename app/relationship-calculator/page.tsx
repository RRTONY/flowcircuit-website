import type { Metadata } from "next";
import RelationshipCalculatorClient from "./RelationshipCalculatorClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "The Relationship Calculator — Flow Circuit Role Dynamics",
  description:
    "Select any two Flow Circuit roles and discover whether the pairing multiplies, complements, or creates productive tension — plus advice for making the relationship work.",
  alternates: { canonical: "https://flow.tonygreenberg.com/relationship-calculator" },
};

export default function Page() {
  return (
    <ClientOnly>
      <RelationshipCalculatorClient />
    </ClientOnly>
  );
}
