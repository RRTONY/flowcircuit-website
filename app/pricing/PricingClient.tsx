"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Zap, Users, Building2, ArrowRight, Crown, Loader2, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import BlogBridge from '@/components/BlogBridge';

const TIERS = [
  {
    name: "Explorer",
    subtitle: "Individual Discovery",
    price: "Free",
    period: "",
    description: "Discover your natural Flow Circuit role and understand your operational energy.",
    icon: Zap,
    color: "#f59e0b",
    features: [
      "Full Flow Circuit Assessment",
      "Your role profile (Spark, Amplifier, Filter, Ground, Conductor)",
      "Combination profile (e.g., Spark-Amplifier)",
      "Purity score and stress radiation map",
      "Shareable results card for social",
      "PDF report download",
      "Optional Soulprint birth data collection",
    ],
    cta: "Take the Assessment",
    tier: "explorer" as const,
    popular: false,
  },
  {
    name: "Tribe",
    subtitle: "Team Performance",
    price: "$29",
    period: "/member/month",
    description: "Map your entire team's energy circuit. See where friction lives and where flow happens.",
    icon: Users,
    color: "#3b82f6",
    features: [
      "Everything in Explorer",
      "Team Energy Map with role strength indicators",
      "Friction pair detection and stress zone analysis",
      "Team composition report with gap analysis",
      "360 Peer Review (self vs. others perception)",
      "Manager Guidebook with role-specific coaching",
      "Slack integration for team notifications",
      "Weekly team health reports",
      "Up to 25 team members",
    ],
    cta: "Start Free for 30 Days",
    tier: "tribe" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    subtitle: "Organizational Intelligence",
    price: "Custom",
    period: "",
    description: "Deploy across departments, M&A integrations, and venture due diligence.",
    icon: Building2,
    color: "#8b5cf6",
    features: [
      "Everything in Tribe",
      "Unlimited team members",
      "Multi-team dashboards and cross-team analysis",
      "Family Dynamic module for executive wellness",
      "M&A integration mapping",
      "Venture due diligence team assessment",
      "Custom API access",
      "Dedicated success manager",
      "Soulprint multi-framework personality reports",
      "White-label options",
      "SOC 2 compliance documentation",
    ],
    cta: "Contact Us",
    tier: "enterprise" as const,
    popular: false,
  },
];

export default function Pricing() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);

  // Check for success/cancel URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Welcome to the Tribe!", {
        description: "Your subscription is active. You now have full access to team features.",
        duration: 8000,
      });
      // Clean URL
      window.history.replaceState({}, "", "/pricing");
    } else if (params.get("canceled") === "true") {
      toast.info("Checkout canceled", {
        description: "No worries — you can subscribe anytime.",
      });
      window.history.replaceState({}, "", "/pricing");
    }
  }, []);

  // Subscription status
  const { data: subStatus } = trpc.stripe.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      setCheckingOut(false);
      toast.info("Redirecting to checkout...", {
        description: "You'll be taken to Stripe to complete your subscription.",
      });
      window.open(data.url, "_blank");
    },
    onError: (err) => {
      setCheckingOut(false);
      toast.error("Checkout failed", { description: err.message });
    },
  });

  const createPortal = trpc.stripe.createPortal.useMutation({
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
    onError: (err) => {
      toast.error("Could not open billing portal", { description: err.message });
    },
  });

  function handleTierClick(tier: (typeof TIERS)[number]) {
    if (tier.tier === "explorer") {
      router.push("/assessment");
      return;
    }

    if (tier.tier === "enterprise") {
      toast.info("Enterprise Inquiry", {
        description: "Enterprise pricing is coming soon. Contact us at hello@theflowcircuit.com for early access.",
      });
      return;
    }

    // Already subscribed? Open portal
    if (subStatus?.active) {
      createPortal.mutate({ origin: window.location.origin });
      return;
    }

    // Go to free trial page
    router.push("/tribe-trial?source=pricing");
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background text-foreground">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto px-4 mb-16">
        <p className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-3">
          Pricing
        </p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Stop guessing. Start mapping.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Individual discovery is free. Team intelligence is where the real ROI lives.
          Companies that align people to their natural operational energy see{" "}
          <strong className="text-foreground">35% less friction cost</strong> and{" "}
          <strong className="text-foreground">3x faster innovation cycles</strong>.
        </p>
      </section>

      {/* Active Subscription Banner */}
      {subStatus?.active && (
        <section className="max-w-3xl mx-auto px-4 mb-8">
          <Card className="border-2 border-green-500 bg-green-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <p className="font-bold text-green-900">Tribe Plan Active</p>
                  <p className="text-sm text-green-700">
                    You have full access to all team features.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => createPortal.mutate({ origin: window.location.origin })}
              >
                <Settings className="w-4 h-4" /> Manage
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Tier Cards */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                tier.popular
                  ? "border-2 border-blue-500 shadow-lg scale-[1.02]"
                  : "border border-gray-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <CardHeader className="pb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${tier.color}20` }}
                >
                  <tier.icon className="w-6 h-6" style={{ color: tier.color }} />
                </div>
                <CardTitle className="text-xl font-black">{tier.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{tier.subtitle}</p>
                <div className="mt-3">
                  <span className="text-4xl font-black">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: tier.color }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full gap-2"
                  variant={tier.popular ? "default" : "outline"}
                  disabled={checkingOut && tier.tier === "tribe"}
                  onClick={() => handleTierClick(tier)}
                >
                  {checkingOut && tier.tier === "tribe" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating checkout...
                    </>
                  ) : subStatus?.active && tier.tier === "tribe" ? (
                    <>
                      <Settings className="w-4 h-4" /> Manage Subscription
                    </>
                  ) : (
                    <>
                      {tier.cta} <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trial Terms below tier cards */}
      <section className="max-w-md mx-auto px-4 mb-16 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-2">
          <p className="text-sm font-bold text-blue-900">No credit card required.</p>
          <p className="text-sm text-blue-800">Full Tribe access for 30 days. Up to 10 team members during trial.</p>
          <p className="text-sm text-blue-700">Converts to $29/member/month on day 31.</p>
          <p className="text-xs text-blue-600">Cancel anytime before then — one click, no questions.</p>
        </div>
      </section>

      {/* ROI Math */}
      <section className="max-w-lg mx-auto px-4 mb-16">
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="p-8 space-y-4">
            <h3 className="font-black text-lg text-center">The ROI Math</h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">One wasted meeting (10 people)</span>
              <span className="font-bold text-red-600">$1,200</span>
            </div>
            <div className="border-t border-amber-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">One month of Tribe (10 people)</span>
              <span className="font-bold text-emerald-600">$290</span>
            </div>
            <div className="border-t border-amber-200" />
            <p className="text-xs text-center text-muted-foreground pt-2">
              The Tribe plan pays for itself the first time a role-misfit handoff doesn't happen.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ROI Section */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <Card className="bg-black text-white border-none overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-amber-400" />
              <p className="text-sm font-bold uppercase tracking-widest text-amber-400">
                The ROI Case
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-6">
              What role misfit actually costs you
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <p className="text-3xl font-black text-amber-400">$40M</p>
                <p className="text-sm text-gray-300 mt-1">
                  Saved in a $2B merger by aligning Spark teams pre-integration,
                  reducing friction costs by 35%.
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-400">80%</p>
                <p className="text-sm text-gray-300 mt-1">
                  Of turnover comes from role misfit, not skill gaps. You're losing
                  people because they're in the wrong seat, not the wrong company.
                </p>
              </div>
              <div>
                <p className="text-3xl font-black text-green-400">3x</p>
                <p className="text-sm text-gray-300 mt-1">
                  Startups with balanced Spark-Ground ratios are 300% more likely
                  to reach Series B than all-Spark visionary teams.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-black text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Is the individual assessment really free?",
              a: "Yes. We believe everyone deserves to know their natural operational energy. The individual Flow Circuit Assessment, your role profile, combination profile, purity score, stress radiation map, and shareable card are all completely free.",
            },
            {
              q: "What's the difference between the free assessment and the Tribe plan?",
              a: "The free assessment tells you who YOU are. The Tribe plan shows you how your energy interacts with your team's energy — where friction lives, where flow happens, and what's missing. Individual results are only 30% of the picture.",
            },
            {
              q: "Can I try the team features before committing?",
              a: "Yes — start a 30-day free trial with no credit card required. You get full Tribe access including team dashboards, 360 peer review, friction pair detection, and the manager guidebook for up to 10 team members. Cancel anytime before day 30, no charge.",
            },
            {
              q: "What is the Soulprint report?",
              a: "Soulprint is an optional deep-dive that maps your birth data across 8+ personality frameworks (Enneagram, Human Design, Gene Keys, Western/Vedic/Chinese Astrology, Spiral Dynamics, Numerology). It reveals WHY you play your Flow Circuit role the way you do. Coming soon as part of the Enterprise tier.",
            },
            {
              q: "How is this different from MBTI or StrengthsFinder?",
              a: "Those tools measure personality traits. The Flow Circuit measures operational energy — how you naturally function in a team context. We don't care if you're an introvert or extrovert. We care whether you're a Spark who generates ideas, a Ground who executes them, or a Conductor who orchestrates the whole circuit.",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <h3 className="font-bold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <BlogBridge pageKey="pricing" />
    </div>
  );
}
