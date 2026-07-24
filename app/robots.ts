import type { MetadataRoute } from "next";

const SITE_URL = "https://flow.tonygreenberg.com";

// Explicitly allow AI answer-engine crawlers (GEO/AEO) alongside traditional
// search bots — being explicit rather than relying on the default `*` catch-all
// so future default-deny changes to any one of these products don't
// silently affect discoverability here.
const AI_CRAWLER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bytespider",
  "Meta-ExternalAgent",
];

// Auth-gated / personal / dynamic-token routes have no canonical shared
// content for a crawler to index — keep them out of the index entirely.
const DISALLOWED = [
  "/api/",
  "/login",
  "/signup",
  "/admin",
  "/reports",
  "/research",
  "/team-dashboard",
  "/team-settings",
  "/team-map",
  "/team-comparison",
  "/enterprise-dashboard",
  "/my-journey",
  "/deep-calibration",
  "/results",
  "/share",
  "/share-card",
  "/feedback",
  "/peer-review/",
  "/360/",
  "/family-360/",
  "/360-results/",
  "/consciousness/",
  "/soulprint/report/",
  "/team/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      ...AI_CRAWLER_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOWED })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
