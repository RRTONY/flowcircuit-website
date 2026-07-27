import type { Metadata } from "next";
import AlphaFeedbackClient from "./AlphaFeedbackClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Alpha Feedback | The Flow Circuit",
  description:
    "Share your honest impression of The Flow Circuit alpha: rate the accuracy of your individual assessment and the team dynamic report, and suggest improvements.",
  alternates: { canonical: "https://flow.tonygreenberg.com/feedback" },
};

export default function FeedbackPage() {
  return (
    <ClientOnly>
      <AlphaFeedbackClient />
    </ClientOnly>
  );
}
