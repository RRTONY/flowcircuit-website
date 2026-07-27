import type { Metadata } from "next";
import IntelClient from "./IntelClient";

export const metadata: Metadata = {
  title: "Mission Critical Intel | Signal in the Noise",
  description:
    "Foundational texts bridging silicon and soul, compute and consciousness — curated commentary on assessments in the news plus the essays shaping how we think about AI, work, and human potential.",
  alternates: { canonical: "https://flow.tonygreenberg.com/intel" },
};

export default function Page() {
  return <IntelClient />;
}
