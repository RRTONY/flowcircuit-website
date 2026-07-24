import type { MetadataRoute } from "next";

const SITE_URL = "https://flow.tonygreenberg.com";

// Public, crawlable marketing/content pages only — excludes admin/dashboard
// pages (auth-gated), dynamic token routes (/peer-review/:token, /360/:token,
// etc.), and personal result pages that have no canonical shared content.
const PUBLIC_ROUTES: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/assessment", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/science", changeFrequency: "monthly", priority: 0.8 },
  { path: "/protocol", changeFrequency: "monthly", priority: 0.7 },
  { path: "/bio", changeFrequency: "monthly", priority: 0.6 },
  { path: "/testimonials", changeFrequency: "weekly", priority: 0.7 },
  { path: "/intel", changeFrequency: "weekly", priority: 0.6 },
  { path: "/sample-reports", changeFrequency: "monthly", priority: 0.6 },
  { path: "/journey", changeFrequency: "monthly", priority: 0.6 },
  { path: "/family", changeFrequency: "monthly", priority: 0.6 },
  { path: "/origin-story", changeFrequency: "monthly", priority: 0.5 },
  { path: "/why-teams-fail", changeFrequency: "monthly", priority: 0.6 },
  { path: "/relationship-calculator", changeFrequency: "monthly", priority: 0.5 },
  { path: "/conductor-playbook", changeFrequency: "monthly", priority: 0.5 },
  { path: "/ma-playbook", changeFrequency: "monthly", priority: 0.5 },
  { path: "/magic-questions", changeFrequency: "monthly", priority: 0.5 },
  { path: "/credibility-timeline", changeFrequency: "monthly", priority: 0.4 },
  { path: "/find-your-path", changeFrequency: "monthly", priority: 0.5 },
  { path: "/efficacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/soulprint", changeFrequency: "monthly", priority: 0.5 },
  { path: "/coaching", changeFrequency: "monthly", priority: 0.5 },
  { path: "/integrations", changeFrequency: "monthly", priority: 0.4 },
  { path: "/white-label", changeFrequency: "monthly", priority: 0.4 },
  { path: "/investor-metrics", changeFrequency: "monthly", priority: 0.3 },
  { path: "/inspirations", changeFrequency: "monthly", priority: 0.4 },
  { path: "/manager-guidebook", changeFrequency: "monthly", priority: 0.5 },
  { path: "/team-builder", changeFrequency: "monthly", priority: 0.5 },
  { path: "/alpha", changeFrequency: "monthly", priority: 0.4 },
  { path: "/tribe-trial", changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
