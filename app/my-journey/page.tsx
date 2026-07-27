import type { Metadata } from "next";
import MyJourneyClient from "./MyJourneyClient";

export const metadata: Metadata = {
  title: "My Journey | The Flow Circuit",
  description:
    "Your Flow Circuit self-discovery command center — view your energy DNA results, teams, assessment history, and continue exploring the full ecosystem in one place.",
  alternates: { canonical: "https://flow.tonygreenberg.com/my-journey" },
};

export default function Page() {
  return <MyJourneyClient />;
}
