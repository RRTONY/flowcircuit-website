import type { Metadata } from "next";
import MagicQuestionsClient from "./MagicQuestionsClient";

export const metadata: Metadata = {
  title: "10 Magic Questions to Make Your Project Go Right",
  description:
    "Tony Greenberg's original framework for kicking assumptions before they kick you — 10 interactive project questions, each mapped to a Flow Circuit role: Spark, Amplifier, Filter, Ground, and Conductor.",
  alternates: { canonical: "https://flow.tonygreenberg.com/magic-questions" },
};

export default function Page() {
  return <MagicQuestionsClient />;
}
