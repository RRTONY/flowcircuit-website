import type { Metadata } from "next";
import AlphaInviteClient from "./AlphaInviteClient";

export const metadata: Metadata = {
  title: "Join the Alpha | The Flow Circuit",
  description:
    "Be one of 10 companies to pilot The Flow Circuit. Create your team, get a single invite link, and see your group's Energy Matrix and friction points.",
  alternates: { canonical: "https://flow.tonygreenberg.com/alpha" },
};

export default function AlphaPage() {
  return <AlphaInviteClient />;
}
