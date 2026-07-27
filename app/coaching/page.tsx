import type { Metadata } from "next";
import CoachingClient from "./CoachingClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Weekly Coaching | The Flow Circuit",
  description:
    "Get personalized weekly coaching prompts based on your Flow Circuit profile — actions to leverage your strengths, stretch your growth edge, and protect against burnout.",
  alternates: { canonical: "https://flow.tonygreenberg.com/coaching" },
};

export default function Page() {
  return (
    <ClientOnly>
      <CoachingClient />
    </ClientOnly>
  );
}
