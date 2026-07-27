import type { Metadata } from "next";
import ComputeCoreClient from "./ComputeCoreClient";

export const metadata: Metadata = {
  title: "Compute Core | Silicon Sanctuary Terminal",
  description:
    "An interactive terminal experience probing the questions AI forces us to ask about purpose, wisdom, and intent — the Silicon Sanctuary interface for The Flow Circuit.",
  alternates: { canonical: "https://flow.tonygreenberg.com/compute-core" },
};

export default function Page() {
  return <ComputeCoreClient />;
}
