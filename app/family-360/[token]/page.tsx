import type { Metadata } from "next";
import Family360ReviewClient from "./Family360ReviewClient";
import { ClientOnly } from "@/components/ClientOnly";

export const metadata: Metadata = {
  title: "Family 360 Review | The Flow Circuit",
  description: "Rank how a family member shows up at home across the five family energy archetypes — anonymous, aggregated feedback.",
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <ClientOnly>
      <Family360ReviewClient token={token} />
    </ClientOnly>
  );
}
