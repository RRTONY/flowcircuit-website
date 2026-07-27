import type { Metadata } from "next";
import SoulPrintLayerClient from "./SoulPrintLayerClient";

export const metadata: Metadata = {
  title: "Consciousness Layer | The Flow Circuit",
  description: "A deeper lens on who you are — an optional consciousness layer drawing from Enneagram, Human Design, Astrology, and Numerology that sits alongside your Flow Circuit profile.",
  alternates: { canonical: "https://flow.tonygreenberg.com/consciousness" },
};

export default function Page() {
  return <SoulPrintLayerClient />;
}
