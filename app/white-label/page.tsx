import type { Metadata } from "next";
import WhiteLabelClient from "./WhiteLabelClient";

export const metadata: Metadata = {
  title: "White-Label Configuration | The Flow Circuit",
  description:
    "Embed the Flow Circuit assessment in your own platform with custom branding. Admin tools for embed codes, REST API access, and webhook payloads for enterprise white-label deployments.",
  alternates: { canonical: "https://flow.tonygreenberg.com/white-label" },
};

export default function Page() {
  return <WhiteLabelClient />;
}
