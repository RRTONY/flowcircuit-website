import type { Metadata } from "next";
import TestimonialsClient from "./TestimonialsClient";

export const metadata: Metadata = {
  title: "Testimonials | The Proof Behind The Flow Circuit",
  description:
    "Real results from the Fortune 500 and voices from a global network of leaders on the impact of Tony Greenberg's work — from RampRate's business outcomes to the Flow Circuit community's own stories.",
  alternates: { canonical: "https://flow.tonygreenberg.com/testimonials" },
};

export default function Page() {
  return <TestimonialsClient />;
}
