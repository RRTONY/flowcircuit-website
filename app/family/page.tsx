import type { Metadata } from "next";
import FamilyDynamicClient from "./FamilyDynamicClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Family Dynamic | The Flow Circuit",
  description:
    "The same Flow Circuit that powers teams also runs through families. Map your family's energy roles, spot friction points, and see where the stress really lives.",
  alternates: { canonical: "https://flow.tonygreenberg.com/family" },
};

export default function FamilyPage() {
  return (
    <ClientOnly>
      <FamilyDynamicClient />
    </ClientOnly>
  );
}
