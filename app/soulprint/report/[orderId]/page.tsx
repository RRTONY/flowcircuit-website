import type { Metadata } from "next";
import SoulPrintClient from "@/app/soulprint/SoulPrintClient";

export const metadata: Metadata = {
  title: "SoulPrint | The Flow Circuit",
  description: "8 ancient + modern frameworks. One AI-synthesized portrait of your soul's operating system — the thing you can't run from, rendered in language you can finally understand.",
};

export default async function Page({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <SoulPrintClient orderId={orderId} />;
}
