"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Zap, Clock } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const timelineEvents = [
  {
    year: "2000",
    title: "The Friction Problem",
    description:
      "RampRate launches. Tony Greenberg begins documenting why brilliant teams produce mediocre results — and mediocre teams occasionally produce brilliance. The variable isn't talent. It's wiring.",
    link: null,
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: "2005",
    title: "The Al Fahden Discovery",
    description:
      "Tony encounters Al Fahden's Team Dimensions Profile — the first framework to name the relay: Creator, Advancer, Refiner, Executor, and Flexer. The Z Process. The idea that innovation isn't a solo act but a baton pass between fundamentally different cognitive styles.",
    link: null,
    color: "from-purple-500 to-violet-500",
  },
  {
    year: "2010",
    title: "Harvard H+ Summit — \"Boiling the Human\"",
    description:
      "On the same stage as Ray Kurzweil, Tony argues that exponential technology without a human operating system creates 'The Land of the Lost.' Madoff's Law: the faster the system, the faster the fraud. The audience expects a tech talk. They get a manifesto.",
    link: "https://tonygreenberg.com/boiling-the-human-h-summit-transcript-harvard-kurzweil/",
    color: "from-red-500 to-orange-500",
  },
  {
    year: "2010",
    title: "The Arithmetic of Relationships",
    description:
      "\"If your 'us' doesn't equal more than you two separately, it just doesn't add up.\" Tony publishes the essay that defines energy multiplication vs. energy subtraction in partnerships — the precursor to the Amplifier role.",
    link: "https://tonygreenberg.com/the-arithmetic-of-relationships-whats-our-mutual-net-profit/",
    color: "from-yellow-500 to-amber-500",
  },
  {
    year: "2014",
    title: "10 Magic Questions — The Z Process Named",
    description:
      "The breakthrough article. Tony explicitly names the relay: \"Tasks are passed from Creators to Advancers, from Advancers to Refiners, and from Refiners to Executors. Flexers fill in the gaps.\" The Flow Circuit has a skeleton. It just doesn't have a name yet.",
    link: "https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/",
    color: "from-green-500 to-emerald-500",
  },
  {
    year: "2015",
    title: "Human Operating System",
    description:
      "The essay that synthesizes everything. Technology should fit humans like a glove — not the reverse. The vision of building systems around human wiring, not forcing humans to adapt to systems. The philosophical foundation of The Flow Circuit.",
    link: "https://tonygreenberg.com/human-operating-system/",
    color: "from-indigo-500 to-blue-500",
  },
  {
    year: "2018",
    title: "ImpactSoul — The Spiritual Dimension",
    description:
      "\"Heal the Body, Mind, & Earth.\" Tony publishes the essay connecting supply chain innovation to transformational impact. The seed of what will become the SoulPrint integration — the idea that team dynamics have a spiritual dimension that assessment science ignores.",
    link: "https://tonygreenberg.com/from-supply-chain-to-the-blockchain-heal-the-body-mind-earth/",
    color: "from-pink-500 to-rose-500",
  },
  {
    year: "2020",
    title: "Mastering Human & Business Development",
    description:
      "The Triangle of Trust: Mind meld → Audit → Friendly guidance → Social impact → Informed introduction. Tony codifies the Conductor's operating manual — how to orchestrate energy between people who don't yet know they need each other.",
    link: "https://tonygreenberg.com/mastering-human-and-business-development/",
    color: "from-teal-500 to-cyan-500",
  },
  {
    year: "2022",
    title: "Davos — World Economic Forum",
    description:
      "The framework goes global. Tony brings the human operating system thesis to the world stage. The question isn't whether teams need better tools — it's whether leadership is ready to admit the tools they have don't work.",
    link: "https://tonygreenberg.com/davos-2022-world-economic-forum/",
    color: "from-amber-500 to-yellow-500",
  },
  {
    year: "2024",
    title: "The Decay of Modern Communication",
    description:
      "Tony documents the collapse: ghosting, accountability death, the end of follow-through. The relay isn't just broken — it's been abandoned. The essay becomes the 'why now' argument for The Flow Circuit.",
    link: "https://tonygreenberg.com/the-decay-of-modern-day-communication/",
    color: "from-red-500 to-pink-500",
  },
  {
    year: "2025",
    title: "The Flow Circuit Launches",
    description:
      "Creator becomes Spark. Advancer becomes Amplifier. Refiner becomes Filter. Executor becomes Ground. Flexer becomes Conductor. The Z Process gets a new name, a digital platform, an AI-powered assessment, and a mission: dramatically cut the time it takes to move from idea to impact.",
    link: null,
    color: "from-primary to-secondary",
  },
];

const nameEvolution = [
  { old: "Creator", new: "Spark", icon: "⚡", reason: "Raw energy that ignites — not just creates, but catalyzes" },
  { old: "Advancer", new: "Amplifier", icon: "📡", reason: "Doesn't just advance — multiplies the signal" },
  { old: "Refiner", new: "Filter", icon: "🔬", reason: "Quality control that separates signal from noise" },
  { old: "Executor", new: "Ground", icon: "🏗️", reason: "The foundation — where vision becomes reality" },
  { old: "Flexer", new: "Conductor", icon: "🎯", reason: "Orchestrates the entire relay — not just filling gaps" },
];

export default function OriginStory() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">25 Years in the Making</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            From the Z Process
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              to The Flow Circuit
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            This framework wasn't built in a weekend hackathon. It was forged across
            25 years of watching brilliant teams fail for preventable reasons — and
            occasionally watching mediocre teams produce miracles when the wiring was right.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 transform md:-translate-x-px" />

            {timelineEvents.map((event, i) => (
              <div
                key={i}
                className={`relative flex flex-col md:flex-row items-start mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary transform -translate-x-1.5 mt-2 z-10 ring-4 ring-background" />

                {/* Content */}
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8"
                  }`}
                >
                  <span
                    className={`inline-block text-sm font-mono font-bold bg-gradient-to-r ${event.color} bg-clip-text text-transparent mb-1`}
                  >
                    {event.year}
                  </span>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {event.description}
                  </p>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-3 font-medium transition-colors"
                    >
                      Read the original
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Name Evolution */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-4">
            The Name Evolution
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Same DNA. Sharper language. Every rename was a refinement of
            understanding — not a rebrand.
          </p>
          <div className="space-y-4">
            {nameEvolution.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-card transition-colors"
              >
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-muted-foreground line-through font-mono text-sm">
                      {item.old}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="font-display font-bold text-foreground">
                      {item.new}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Thesis */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-center mb-8">
            The Thesis That Never Changed
          </h2>
          <blockquote className="text-xl md:text-2xl text-center text-muted-foreground italic leading-relaxed border-l-4 border-primary pl-6 md:border-l-0 md:pl-0">
            "Teams don't fail because they lack talent. They fail because they
            don't understand their own wiring. Technology alone can't fix what's
            fundamentally a human operating system problem."
          </blockquote>
          <p className="text-center text-sm text-muted-foreground mt-4">
            — The through-line from Harvard 2010 to The Flow Circuit 2025
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-2xl mx-auto text-center">
          <Zap className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            25 Years of Research. 5 Minutes to Discover Your Role.
          </h2>
          <p className="text-muted-foreground mb-8">
            The framework is ready. The assessment is live. Find out where you
            fit in the relay.
          </p>
          <Link href="/assessment">
            <Button
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold shadow-lg"
            >
              Take the Assessment
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <BlogBridge pageKey="science" />
    </div>
  );
}
