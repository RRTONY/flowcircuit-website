import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Stop Fighting Your Nature",
  description:
    "Discover your natural energy role in 5 minutes. The Flow Circuit maps the invisible architecture of team performance — Spark, Amplifier, Filter, Ground, or Conductor. Used by teams at RampRate, ImpactSoul, and more.",
  alternates: { canonical: "https://flow.tonygreenberg.com/" },
};

export default function Page() {
  return <HomeClient />;
}
