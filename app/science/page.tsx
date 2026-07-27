import type { Metadata } from "next";
import ScienceClient from "./ScienceClient";

export const metadata: Metadata = {
  title: "The Science | Why Who You Are Matters More Than What You Know",
  description:
    "The research behind The Flow Circuit: why innate energy is fixed, why role misfit creates measurable stress, and why balanced teams outperform teams of individual stars — backed by 40 years of performance research.",
  alternates: { canonical: "https://flow.tonygreenberg.com/science" },
};

export default function Page() {
  return <ScienceClient />;
}
