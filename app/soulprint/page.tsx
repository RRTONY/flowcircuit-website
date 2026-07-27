import type { Metadata } from "next";
import SoulPrintClient from "./SoulPrintClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "SoulPrint | The Flow Circuit",
  description: "8 ancient + modern frameworks. One AI-synthesized portrait of your soul's operating system — the thing you can't run from, rendered in language you can finally understand.",
  alternates: { canonical: "https://flow.tonygreenberg.com/soulprint" },
};

export default function Page() {
  return (
    <ClientOnly>
      <SoulPrintClient />
    </ClientOnly>
  );
}
