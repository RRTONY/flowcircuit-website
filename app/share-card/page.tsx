import type { Metadata } from "next";
import ShareCardClient from "./ShareCardClient";

export const metadata: Metadata = {
  title: "Your Flow Card | The Flow Circuit",
  description:
    "Generate and share your Flow Circuit results card — a downloadable, shareable graphic of your energy DNA role and purity score, ready for LinkedIn or your team.",
  alternates: { canonical: "https://flow.tonygreenberg.com/share-card" },
};

export default function Page() {
  return <ShareCardClient />;
}
