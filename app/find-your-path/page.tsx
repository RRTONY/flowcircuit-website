import type { Metadata } from "next";
import FindYourPathClient from "./FindYourPathClient";

export const metadata: Metadata = {
  title: "Find Your Frequency | The Flow Circuit",
  description:
    "Five portals into the same truth: your Energy DNA, Soul Blueprint, Tribe Circuit, Impact Vector, and Sacred Element. Discover where to begin your self-discovery journey across the Greenberg Ecosystem.",
  alternates: { canonical: "https://flow.tonygreenberg.com/find-your-path" },
};

export default function Page() {
  return <FindYourPathClient />;
}
