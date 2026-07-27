import type { Metadata } from "next";
import BioClient from "./BioClient";

export const metadata: Metadata = {
  title: "Tony Greenberg | Architect of the Invisible",
  description:
    "Meet Tony Greenberg, founder of RampRate and creator of The Flow Circuit — an entrepreneur turned architect of human operating systems, bridging business impact with the science of human energy.",
  alternates: { canonical: "https://flow.tonygreenberg.com/bio" },
};

export default function Page() {
  return <BioClient />;
}
