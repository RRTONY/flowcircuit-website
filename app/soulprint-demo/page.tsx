import type { Metadata } from "next";
import SoulprintDemoClient from "./SoulprintDemoClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Soulprint Demo | The Flow Circuit",
  description: "Internal demo — static Soulprint report render for review.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <ClientOnly>
      <SoulprintDemoClient />
    </ClientOnly>
  );
}
