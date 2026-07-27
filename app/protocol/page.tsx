import type { Metadata } from "next";
import ProtocolClient from "./ProtocolClient";

export const metadata: Metadata = {
  title: "The Protocol | The Operating Manual for High-Performance Teams",
  description:
    "The rules of engagement for the Flow Circuit: how the baton passes from Spark to Amplifier to Filter to Ground, the Facilitator's role, and how teams navigate resistance to a new operating system.",
  alternates: { canonical: "https://flow.tonygreenberg.com/protocol" },
};

export default function Page() {
  return <ProtocolClient />;
}
