"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, AlertTriangle, Zap, Users, MessageSquareOff, Shield, Filter as FilterIcon } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const failures = [
  {
    id: "all-spark",
    title: "The All-Spark Team",
    subtitle: "When Everyone's a Visionary and Nobody Executes",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    borderColor: "border-yellow-500/30",
    symptoms: [
      "Endless brainstorming sessions that produce nothing",
      "Twelve competing visions, zero shipped products",
      "\"We pivoted\" is said more often than \"We shipped\"",
      "The team is exciting to join and impossible to stay in",
    ],
    diagnosis:
      "The circuit is overloaded with Spark energy and starved of Ground. Every idea gets amplified, nothing gets filtered, and the relay never reaches execution. It's a fireworks factory with no fire exits.",
    realWorld:
      "This is exactly what happens when big business acquires a startup. The acquirer's Ground culture suffocates the acquired's Spark energy — or worse, the Sparks leave and the acquirer is left with an empty shell they paid billions for.",
    blogLink: {
      title: "Save the Entrepreneur",
      url: "https://tonygreenberg.com/save-the-entrepreneur-big-business-keeps-buying-startups-and-killing-em/",
      context: "Tony documented this pattern years before naming it: big business buys innovation and kills it.",
    },
    fix: "Add Ground. Not more Sparks. The team needs someone whose identity is tied to making things real, not making things new. One strong Ground can anchor five Sparks.",
  },
  {
    id: "ghost-circuit",
    title: "The Ghost Circuit",
    subtitle: "When Communication Dies and Accountability Vanishes",
    icon: MessageSquareOff,
    color: "from-gray-500 to-slate-500",
    borderColor: "border-gray-500/30",
    symptoms: [
      "Emails go unanswered for days, then weeks",
      "Meetings are scheduled to discuss why previous meetings produced nothing",
      "\"I thought you were handling that\" is the team's unofficial motto",
      "Ghosting has become an acceptable management strategy",
    ],
    diagnosis:
      "The Conductor role is missing entirely. Nobody is orchestrating the handoffs. The relay baton is on the floor and everyone is staring at it, waiting for someone else to pick it up.",
    realWorld:
      "The decay of modern communication isn't just a social media problem — it's an organizational disease. When follow-through dies, the relay doesn't just slow down. It stops. And the team doesn't even notice until the deadline has passed.",
    blogLink: {
      title: "The Decay of Modern Day Communication",
      url: "https://tonygreenberg.com/the-decay-of-modern-day-communication/",
      context: "Tony's diagnosis of the accountability collapse — ghosting as organizational cancer.",
    },
    fix: "Appoint a Conductor. Not a project manager — a Conductor. Someone whose job is to ensure every handoff happens, every baton is caught, and every ghost gets called back to the living.",
  },
  {
    id: "trust-deficit",
    title: "The Trust Deficit",
    subtitle: "When the Foundation Crumbles and Nothing Sticks",
    icon: Shield,
    color: "from-blue-500 to-indigo-500",
    borderColor: "border-blue-500/30",
    symptoms: [
      "People hedge their commitments with escape clauses",
      "Information is hoarded as leverage, not shared as fuel",
      "\"Cover your ass\" documentation exceeds actual work product",
      "New hires are warned about who not to trust within the first week",
    ],
    diagnosis:
      "The Ground role has been compromised. Without trust, the relay becomes a series of isolated transactions instead of a continuous flow. People protect themselves instead of the mission.",
    realWorld:
      "Trust isn't a soft skill — it's the foundation of all commerce and collaboration. When Tony asks \"Are you really my friend?\" he's asking the question every team member is secretly asking: can I hand you this baton and trust you'll run with it?",
    blogLink: {
      title: "Trust Us? Are You Really My Friend?",
      url: "https://tonygreenberg.com/trust-us-are-you-really-my-friend/",
      context: "Trust as the foundation of all commerce — without it, no relay can function.",
    },
    fix: "Rebuild Ground from the bottom up. Start with radical transparency about what's broken. The team doesn't need a trust-building exercise — they need someone willing to be the first to be vulnerable.",
  },
  {
    id: "filter-trap",
    title: "The Filter Trap",
    subtitle: "When Quality Control Becomes Paralysis",
    icon: FilterIcon,
    color: "from-red-500 to-rose-500",
    borderColor: "border-red-500/30",
    symptoms: [
      "Every proposal requires three rounds of review before anyone sees it",
      "\"Let's do more research\" is the response to every decision point",
      "Perfect is the enemy of shipped — and perfect always wins",
      "The team produces beautiful analysis of why they can't move forward",
    ],
    diagnosis:
      "The Filter role has metastasized. What should be a quality checkpoint has become a quality prison. The relay gets stuck in an infinite refinement loop — the baton goes back to the Filter over and over, never reaching Ground.",
    realWorld:
      "This is the ethical vs. economic tug of war playing out in real-time. When quality control and ethics collide with speed and profit, the Filter can become either the team's conscience or its cage. The difference is whether the Filter knows when to let go.",
    blogLink: {
      title: "The Tug of War — Ethical vs. Economic Decisions",
      url: "https://tonygreenberg.com/the-tug-of-war-ethical-vs-economic-decisions/",
      context: "When the Filter role becomes a trap — quality control vs. forward motion.",
    },
    fix: "Give the Filter a deadline, not a mandate. The Filter's job is to improve the baton, not hold it hostage. Set a time-box: refine for 48 hours, then pass it forward — ready or not.",
  },
];

export default function WhyTeamsFail() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-8">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-mono text-destructive">Diagnostic Lab</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Why Teams Fail
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            It's never about talent. It's never about tools. It's about the
            wiring. Here are the four circuit failures we see in every
            organization — and the fix for each one.
          </p>
        </div>
      </section>

      {/* Failure Case Studies */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-16">
          {failures.map((failure, i) => (
            <article
              key={failure.id}
              id={failure.id}
              className={`rounded-2xl border ${failure.borderColor} bg-card/30 overflow-hidden`}
            >
              {/* Header */}
              <div className={`p-8 bg-gradient-to-r ${failure.color} bg-opacity-10`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-background/20 backdrop-blur flex items-center justify-center">
                    <failure.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-white/70 uppercase tracking-wider">
                      Failure Pattern #{i + 1}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
                      {failure.title}
                    </h2>
                  </div>
                </div>
                <p className="text-lg text-white/80 italic">{failure.subtitle}</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Symptoms */}
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
                    Symptoms
                  </h3>
                  <ul className="space-y-2">
                    {failure.symptoms.map((s, j) => (
                      <li key={j} className="flex items-start gap-3 text-foreground">
                        <span className="text-destructive mt-1">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    Circuit Diagnosis
                  </h3>
                  <p className="text-foreground leading-relaxed">{failure.diagnosis}</p>
                </div>

                {/* Real World */}
                <div>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">
                    In the Wild
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{failure.realWorld}</p>
                </div>

                {/* Blog Link */}
                <a
                  href={failure.blogLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        From the Archives
                      </span>
                      <h4 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mt-1">
                        {failure.blogLink.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {failure.blogLink.context}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                </a>

                {/* Fix */}
                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-3">
                    The Fix
                  </h3>
                  <p className="text-foreground leading-relaxed font-medium">
                    {failure.fix}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Diagnose Your Team's Circuit
          </h2>
          <p className="text-muted-foreground mb-8">
            Which failure pattern does your team match? Take the assessment to
            find out — then share it with your team to see the full picture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button
                size="lg"
                className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg"
              >
                Take the Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/origin-story">
              <Button size="lg" variant="outline" className="font-medium">
                Read the Origin Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BlogBridge pageKey="protocol" />
    </div>
  );
}
