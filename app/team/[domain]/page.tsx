import type { Metadata } from "next";
import TeamProfileClient from "./TeamProfileClient";
import { ClientOnly } from "@/components/ClientOnly";

export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: `${domain} Team Energy Map | The Flow Circuit`,
    description: `See ${domain}'s Flow Circuit team energy map: role distribution, friction pairs, and hiring gaps.`,
  };
}

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  return (
    <ClientOnly>
      <TeamProfileClient domain={domain} />
    </ClientOnly>
  );
}
