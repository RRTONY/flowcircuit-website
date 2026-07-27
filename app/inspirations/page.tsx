import type { Metadata } from "next";
import InspirationsClient from "./InspirationsClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Inspirations | The Minds Behind The Flow Circuit",
  description:
    "The thinkers, researchers, and practitioners whose work shaped The Flow Circuit — from Al Fahden's Team Dimensions to Csikszentmihalyi's flow state, Belbin's team roles, and the research citations behind the assessment.",
  alternates: { canonical: "https://flow.tonygreenberg.com/inspirations" },
};

export default function Page() {
  return (
    <ClientOnly>
      <InspirationsClient />
    </ClientOnly>
  );
}
