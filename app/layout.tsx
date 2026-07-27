import type { Metadata } from "next";
import { Manrope, Space_Mono, Syne } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import { NoScrapeGuard } from "@/components/NoScrapeGuard";
import Navbar from "@/components/Navbar";
import FloatingCTA from "@/components/FloatingCTA";
import EcosystemFooter from "@/components/EcosystemFooter";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-space-mono",
  display: "swap",
});

const SITE_URL = "https://flow.tonygreenberg.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "The Flow Circuit | Discover Your Natural Energy Role in 5 Minutes",
  description:
    "12 questions. 5 minutes. Discover if you're the Spark, Amplifier, Filter, Ground, or Conductor. Map your team's invisible architecture and cut 70% of innovation friction.",
  keywords: [
    "team assessment", "energy roles", "innovation cycle", "team dynamics",
    "flow state", "personality assessment", "team building",
    "Spark", "Amplifier", "Filter", "Ground", "Conductor",
  ],
  authors: [{ name: "Tony Greenberg" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "The Flow Circuit | What's Your Energy Role?",
    description:
      "Every team runs on 5 energy roles. Most groups have too many of one and zero of another. That imbalance is where all the friction lives. Find yours in 5 minutes.",
    siteName: "The Flow Circuit",
    images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Flow Circuit | What's Your Energy Role?",
    description:
      "Every team runs on 5 energy roles. Most groups have too many of one and zero of another. Find yours in 5 minutes.",
    images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"],
  },
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "The Flow Circuit",
  url: SITE_URL,
  description:
    "A 12-question forced-rank assessment that reveals your natural energy role on a team. Maps team dynamics and identifies friction points.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Tony Greenberg", url: "https://tonygreenberg.com" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Flow Circuit assessment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Flow Circuit is a 12-question forced-rank assessment that reveals your natural energy role on a team. It identifies whether you are a Spark (idea generator), Amplifier (momentum builder), Filter (quality controller), Ground (executor), or Conductor (orchestrator).",
      },
    },
    {
      "@type": "Question",
      name: "How long does the assessment take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The assessment takes approximately 5 minutes to complete. It consists of 12 forced-rank questions where you order 5 options from most like you to least like you.",
      },
    },
    {
      "@type": "Question",
      name: "What are the 5 energy roles?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Spark (ignites ideas), Amplifier (builds momentum), Filter (stress-tests plans), Ground (executes with precision), and Conductor (orchestrates the flow between all roles).",
      },
    },
    {
      "@type": "Question",
      name: "How does team mapping work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When multiple people from the same email domain take the assessment, they are automatically grouped into a team. The system generates a Team Energy Map showing role distribution and friction points.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${syne.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <NoScrapeGuard />
          <Navbar />
          {children}
          <FloatingCTA />
          <EcosystemFooter />
        </Providers>
        {process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT && process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID && (
          <Script
            defer
            src={`${process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT}/umami`}
            data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
