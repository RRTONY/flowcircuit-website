import type { Metadata } from "next";
import SoulPrintLayerClient from "@/app/consciousness/SoulPrintLayerClient";

export const metadata: Metadata = {
  title: "Consciousness Layer | The Flow Circuit",
  description: "A deeper lens on who you are — an optional consciousness layer drawing from Enneagram, Human Design, Astrology, and Numerology that sits alongside your Flow Circuit profile.",
};

export default async function Page({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params;
  return <SoulPrintLayerClient assessmentId={assessmentId} />;
}
