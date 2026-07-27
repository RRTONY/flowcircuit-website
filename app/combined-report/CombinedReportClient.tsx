"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Fingerprint, Zap, Lock, Sparkles, Brain, Heart, Eye } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const reportSections = [
  {
    icon: Zap,
    title: "Your Flow Circuit DNA",
    description: "Your dominant role, percentage breakdown across all five roles, behavioral patterns, blind spots, and how you relay energy in a team. The part of you that shows up at work whether you want it to or not.",
    source: "Flow Circuit Assessment",
    color: "text-yellow-400",
  },
  {
    icon: Fingerprint,
    title: "Your SoulPrint Blueprint",
    description: "Your natal chart, Human Design type, Enneagram pattern, and Gene Keys profile. The underlying inertia of your soul — what you're built for at a level deeper than personality.",
    source: "TrueSelf SoulPrint",
    color: "text-purple-400",
  },
  {
    icon: Brain,
    title: "The Convergence Analysis",
    description: "Where your team wiring and your soul blueprint align — and where they conflict. This is the section that explains why you keep ending up in the same role, the same conflicts, the same breakthroughs.",
    source: "AI-Synthesized",
    color: "text-cyan-400",
  },
  {
    icon: Heart,
    title: "The Resistance Map",
    description: "What your soul won't let you stop doing, even when your team role says otherwise. The tension between who you are in a meeting and who you are at 3am when nobody's watching.",
    source: "AI-Synthesized",
    color: "text-rose-400",
  },
  {
    icon: Eye,
    title: "The Integration Path",
    description: "Actionable guidance for aligning your team role with your soul's blueprint. Not a prescription — a map. Where to lean in, where to let go, and where the real growth lives.",
    source: "AI-Synthesized",
    color: "text-emerald-400",
  },
];

const tiers = [
  {
    name: "The Blueprint",
    subtitle: "Science-Driven",
    description: "Behavioral psychology, neuroscience-backed personality patterns, cognitive tendencies. The things you can measure, replicate, and defend in a board meeting.",
    icon: "🔬",
  },
  {
    name: "The Compass",
    subtitle: "Standard",
    description: "Enneagram, Human Design, astrology fundamentals. The patterns that are just there — whether you believe in them or not.",
    icon: "🧭",
  },
  {
    name: "The Oracle",
    subtitle: "Deeply Spiritual",
    description: "Gene Keys, Vedic astrology, karmic patterns, soul purpose, shadow work. The dimension that assessment science pretends doesn't exist.",
    icon: "🔮",
  },
];

export default function CombinedReport() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-mono text-purple-400">DNA + Soul</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            The Combined Report
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your Flow Circuit tells you how you wire into a team. Your SoulPrint
            tells you what your soul won't let you stop doing. The Combined
            Report tells you{" "}
            <span className="text-foreground font-semibold">why</span> — and
            what to do about it.
          </p>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            What's Inside the 12,000-Word Report
          </h2>
          <div className="space-y-6">
            {reportSections.map((section, i) => (
              <div
                key={i}
                className="flex items-start gap-5 p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                  <section.icon className={`w-6 h-6 ${section.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-foreground text-lg">
                      {section.title}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">
                      {section.source}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Tiers */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            Choose Your Depth
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Three tiers of SoulPrint analysis. Same Flow Circuit DNA. Different
            levels of how far down the rabbit hole you want to go.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors text-center"
              >
                <span className="text-4xl mb-4 block">{tier.icon}</span>
                <h3 className="font-display font-bold text-foreground text-xl mb-1">
                  {tier.name}
                </h3>
                <span className="text-xs font-mono text-primary uppercase tracking-wider">
                  {tier.subtitle}
                </span>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Take the Flow Circuit Assessment",
                desc: "12 questions. 5 minutes. Discover your dominant role and percentage breakdown across Spark, Amplifier, Filter, Ground, and Conductor.",
              },
              {
                step: "02",
                title: "Add Your Birth Data",
                desc: "Date, time, and place of birth. This feeds the SoulPrint engine — your natal chart, Human Design, Enneagram, and Gene Keys profile.",
              },
              {
                step: "03",
                title: "Choose Your Tier",
                desc: "Blueprint (science-driven), Compass (standard), or Oracle (deeply spiritual). Each tier goes deeper into the soul dimension.",
              },
              {
                step: "04",
                title: "Receive Your Combined Report",
                desc: "12,000+ words of AI-synthesized analysis merging your team DNA with your soul blueprint. Delivered in minutes, not weeks.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-6">
                <span className="text-3xl font-mono font-bold text-primary/30 shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Status */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="p-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 text-center">
            <Lock className="w-8 h-8 text-purple-400 mx-auto mb-4" />
            <h3 className="font-display font-bold text-xl mb-3">
              Integration Status: Alpha
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The Combined Report is powered by a partnership between The Flow
              Circuit and TrueSelf's SoulPrint platform. The first 1,000 users
              receive SoulPrint analysis free. After that, standalone SoulPrint
              reports are $44.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button
                  size="lg"
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold"
                >
                  Start with the Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/soulprint">
                <Button size="lg" variant="outline" className="font-medium">
                  <Fingerprint className="mr-2 w-4 h-4" />
                  Learn About SoulPrint
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="soulprint" />
    </div>
  );
}
