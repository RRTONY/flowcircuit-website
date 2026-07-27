"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Building2, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Users, Zap, Shield, Target } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const phases = [
  {
    phase: "Pre-Deal",
    title: "Circuit Due Diligence",
    subtitle: "Before the handshake, map the wiring.",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    steps: [
      "Map the acquirer's circuit composition — where are they heavy, where are they light?",
      "Map the target's circuit composition — what energy are you actually buying?",
      "Identify the Spark carriers — the people whose departure would kill the deal's value",
      "Calculate the 'Organ Rejection Risk' — how compatible are the two circuits?",
    ],
    keyQuestion: "If the target's top 3 Sparks leave within 18 months, is the deal still worth the price?",
    stat: { value: "$40M", label: "Average friction cost savings when circuit mapping is done pre-deal" },
  },
  {
    phase: "Day 1–90",
    title: "The Nervous System Merge",
    subtitle: "Don't just merge org charts. Merge operating rhythms.",
    icon: Users,
    color: "from-purple-500 to-violet-500",
    steps: [
      "Pair complementary roles across both organizations — Spark-to-Ground, not Spark-to-Spark",
      "Identify and protect the Conductors — they're the bridge between the two cultures",
      "Create 'Circuit Integration Teams' with balanced representation from both sides",
      "Establish shared relay protocols — how does the baton pass between the old and new?",
    ],
    keyQuestion: "Have you identified who will conduct the handoffs between the two organizations — or are you hoping it happens organically?",
    stat: { value: "35%", label: "Reduction in integration friction when relay protocols are established in the first 90 days" },
  },
  {
    phase: "Day 90–365",
    title: "The Culture Circuit",
    subtitle: "Culture isn't values on a wall. It's how the relay actually runs.",
    icon: Shield,
    color: "from-emerald-500 to-green-500",
    steps: [
      "Audit the combined circuit for gaps — did the merger create new blind spots?",
      "Rebuild trust capital between teams that were competitors 90 days ago",
      "Establish the new Ground — who executes in the merged entity?",
      "Measure relay velocity — is the combined organization faster or slower than the parts?",
    ],
    keyQuestion: "Is the merged organization producing more than the two separate organizations did — or have you just created a bigger, slower version of what you had?",
    stat: { value: "3x", label: "Likelihood of hitting synergy targets when circuit health is monitored quarterly" },
  },
];

const antiPatterns = [
  {
    title: "The Talent Acquisition Trap",
    description: "Buying a company for its Sparks, then putting them in a Ground-heavy culture where they suffocate. The Sparks leave. You're left with the shell.",
    blogLink: "https://tonygreenberg.com/save-the-entrepreneur-big-business-keeps-buying-startups-and-killing-em/",
    blogTitle: "Save the Entrepreneur",
  },
  {
    title: "The Org Chart Merger",
    description: "Merging reporting lines without merging operating rhythms. People report to new bosses but relay the same way they always did — which is now incompatible with the new structure.",
    blogLink: null,
    blogTitle: null,
  },
  {
    title: "The Culture Deck Fantasy",
    description: "Writing a new set of values and expecting the circuit to rewire itself. Culture isn't what you say — it's how the relay actually runs when nobody's watching.",
    blogLink: "https://tonygreenberg.com/the-decay-of-modern-day-communication/",
    blogTitle: "The Decay of Modern Day Communication",
  },
];

export default function MAPlaybook() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono text-emerald-400">High-Stakes Integration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            The M&A
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Integration Playbook
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Don't just merge balance sheets — merge nervous systems. The Flow
            Circuit framework applied to the highest-stakes team integration
            challenge in business.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
              <h2 className="text-2xl font-display font-bold">The $2.4 Trillion Problem</h2>
            </div>
            <p className="text-foreground leading-relaxed mb-4">
              70-90% of mergers and acquisitions fail to achieve their stated
              synergy targets. The reason isn't financial — it's human. When you
              merge two organizations, you're merging two circuits. And if you
              don't understand the wiring of each one, you're not integrating —
              you're colliding.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Flow Circuit provides a diagnostic framework that maps the
              human wiring of both organizations before, during, and after the
              merger — so you can predict where the organ rejection will happen
              and prevent it.
            </p>
          </div>
        </div>
      </section>

      {/* Three Phases */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {phases.map((phase, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden">
              <div className={`p-6 bg-gradient-to-r ${phase.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <phase.icon className="w-6 h-6 text-white" />
                  <span className="text-xs font-mono text-white/70 uppercase tracking-wider">
                    {phase.phase}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold text-white">{phase.title}</h3>
                <p className="text-white/80 italic mt-1">{phase.subtitle}</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                    Action Steps
                  </h4>
                  <ul className="space-y-3">
                    {phase.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <span className="text-xs font-mono uppercase tracking-wider text-primary">
                    Key Question
                  </span>
                  <p className="text-foreground font-medium mt-1">{phase.keyQuestion}</p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <DollarSign className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <span className="text-2xl font-display font-bold text-primary">{phase.stat.value}</span>
                    <p className="text-sm text-muted-foreground">{phase.stat.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anti-Patterns */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            M&A Anti-Patterns
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            The mistakes that kill deals after the ink is dry.
          </p>
          <div className="space-y-6">
            {antiPatterns.map((ap, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/50 bg-card/30">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-display font-bold text-foreground text-lg mb-2">
                      {ap.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{ap.description}</p>
                    {ap.blogLink && (
                      <a
                        href={ap.blogLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-3 font-medium transition-colors"
                      >
                        Deep dive: {ap.blogTitle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <TrendingUp className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Planning a Merger or Acquisition?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start with the circuit map. Have both teams take the assessment, then
            use the Enterprise Dashboard to compare compositions before the deal
            closes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/enterprise-dashboard">
              <Button
                size="lg"
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg"
              >
                View Enterprise Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/why-teams-fail">
              <Button size="lg" variant="outline" className="font-medium">
                Read Why Teams Fail
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="science" />
    </div>
  );
}
