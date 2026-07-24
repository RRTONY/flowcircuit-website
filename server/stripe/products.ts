/**
 * Stripe Product & Price Configuration
 * 
 * Products are created dynamically in Stripe on first use.
 * This file defines the product catalog and pricing tiers.
 */

export const PRODUCTS = {
  tribe: {
    name: "Flow Circuit — Tribe Plan",
    description: "Team Performance: Map your team's energy circuit. See friction, find flow.",
    priceAmountCents: 2900, // $29.00
    currency: "usd",
    interval: "month" as const,
    features: [
      "Team Energy Map with role strength indicators",
      "Friction pair detection and stress zone analysis",
      "Team composition report with gap analysis",
      "360 Peer Review (self vs. others perception)",
      "Manager Guidebook with role-specific coaching",
      "Weekly team health reports",
      "Up to 25 team members",
    ],
    metadata: {
      tier: "tribe",
      maxMembers: "25",
    },
  },
  enterprise: {
    name: "Flow Circuit — Enterprise Plan",
    description: "Organizational Intelligence: Deploy across departments, M&A, and venture due diligence.",
    // Enterprise is custom pricing — contact sales
    priceAmountCents: null,
    currency: "usd",
    interval: null,
    features: [
      "Unlimited team members",
      "Multi-team dashboards",
      "Family Dynamic module",
      "M&A integration mapping",
      "Custom API access",
      "Dedicated success manager",
      "White-label options",
    ],
    metadata: {
      tier: "enterprise",
    },
  },
} as const;

export type ProductTier = keyof typeof PRODUCTS;
