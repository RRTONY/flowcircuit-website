import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Award, Globe, Mic, BookOpen, Building2, Users, Zap, Newspaper, TrendingUp } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const milestones = [
  {
    year: "2000",
    category: "Company",
    icon: Building2,
    title: "RampRate Founded",
    description: "Tony Greenberg launches RampRate, the world's first technology sourcing advisory. The mission: eliminate friction between what companies need and what vendors provide. The pattern recognition begins.",
    link: null,
    color: "bg-blue-500",
  },
  {
    year: "2005",
    category: "Discovery",
    icon: Zap,
    title: "Al Fahden & The Z Process",
    description: "Tony encounters Al Fahden's Team Dimensions Profile — Creator, Advancer, Refiner, Executor, Flexer. The framework that will become The Flow Circuit gets its first skeleton.",
    link: null,
    color: "bg-yellow-500",
  },
  {
    year: "2008",
    category: "Recognition",
    icon: Award,
    title: "Ernst & Young Entrepreneur of the Year Finalist",
    description: "RampRate's friction-reduction model earns national recognition. The business case for understanding human wiring in commercial relationships is validated at scale.",
    link: null,
    color: "bg-emerald-500",
  },
  {
    year: "2010",
    category: "Speaking",
    icon: Mic,
    title: "Harvard H+ Summit — \"Boiling the Human\"",
    description: "On stage with Ray Kurzweil, Tony argues that exponential technology without a human operating system creates catastrophe. Madoff's Law is born: the faster the system, the faster the fraud.",
    link: "https://tonygreenberg.com/boiling-the-human-h-summit-transcript-harvard-kurzweil/",
    color: "bg-red-500",
  },
  {
    year: "2012",
    category: "Media",
    icon: Newspaper,
    title: "Forbes, Inc., Huffington Post",
    description: "Tony's insights on technology sourcing, entrepreneurship, and human dynamics reach mainstream business media. The ideas that will become The Flow Circuit start reaching a broader audience.",
    link: null,
    color: "bg-purple-500",
  },
  {
    year: "2014",
    category: "Publication",
    icon: BookOpen,
    title: "\"10 Magic Questions\" Published",
    description: "The breakthrough article that explicitly names the relay: Creator → Advancer → Refiner → Executor → Flexer. The Z Process gets its first public documentation with practical application.",
    link: "https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/",
    color: "bg-amber-500",
  },
  {
    year: "2015",
    category: "Publication",
    icon: BookOpen,
    title: "\"Human Operating System\" Essay",
    description: "The philosophical foundation crystallizes: technology should fit humans like a glove, not the reverse. The vision of building systems around human wiring becomes explicit.",
    link: "https://tonygreenberg.com/human-operating-system/",
    color: "bg-indigo-500",
  },
  {
    year: "2017",
    category: "Company",
    icon: Building2,
    title: "RampRate Reaches $40B in Managed Transactions",
    description: "The friction-reduction model proves itself at scale. $40 billion in technology transactions optimized through the same pattern recognition that will power The Flow Circuit.",
    link: null,
    color: "bg-emerald-500",
  },
  {
    year: "2018",
    category: "Initiative",
    icon: Globe,
    title: "ImpactSoul Launches",
    description: "\"Heal the Body, Mind, & Earth.\" Tony connects supply chain innovation to transformational impact. The seed of the SoulPrint integration — team dynamics meet spiritual dimension.",
    link: "https://tonygreenberg.com/from-supply-chain-to-the-blockchain-heal-the-body-mind-earth/",
    color: "bg-pink-500",
  },
  {
    year: "2020",
    category: "Publication",
    icon: BookOpen,
    title: "\"Mastering Human & Business Development\"",
    description: "The Conductor's manual gets codified. The Triangle of Trust: Mind meld → Audit → Friendly guidance → Social impact → Informed introduction. The operating system for human orchestration.",
    link: "https://tonygreenberg.com/mastering-human-and-business-development/",
    color: "bg-teal-500",
  },
  {
    year: "2022",
    category: "Speaking",
    icon: Globe,
    title: "World Economic Forum — Davos",
    description: "The human operating system thesis goes global. Tony brings the framework to the world stage, arguing that leadership's biggest gap isn't technology — it's understanding human wiring.",
    link: "https://tonygreenberg.com/davos-2022-world-economic-forum/",
    color: "bg-blue-500",
  },
  {
    year: "2024",
    category: "Publication",
    icon: BookOpen,
    title: "\"The Decay of Modern Communication\"",
    description: "Tony documents the collapse of accountability — ghosting, follow-through death, the end of the relay. The essay becomes the 'why now' argument for The Flow Circuit.",
    link: "https://tonygreenberg.com/the-decay-of-modern-day-communication/",
    color: "bg-rose-500",
  },
  {
    year: "2025",
    category: "Launch",
    icon: Zap,
    title: "The Flow Circuit Launches",
    description: "25 years of pattern recognition becomes a platform. Creator → Spark. Advancer → Amplifier. Refiner → Filter. Executor → Ground. Flexer → Conductor. The relay goes digital.",
    link: null,
    color: "bg-yellow-500",
  },
  {
    year: "2025",
    category: "Partnership",
    icon: Users,
    title: "SoulPrint Integration (Alpha)",
    description: "Partnership with Max Marmer's TrueSelf platform. The Flow Circuit maps your team DNA. SoulPrint maps your soul blueprint. The combined report tells you why you can't stop being who you are.",
    link: null,
    color: "bg-purple-500",
  },
];

const categoryColors: Record<string, string> = {
  Company: "text-blue-400",
  Discovery: "text-yellow-400",
  Recognition: "text-emerald-400",
  Speaking: "text-red-400",
  Media: "text-purple-400",
  Publication: "text-amber-400",
  Initiative: "text-pink-400",
  Launch: "text-yellow-400",
  Partnership: "text-purple-400",
};

export default function CredibilityTimeline() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">The Journey</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            25 Years of
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Pattern Recognition
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The Flow Circuit wasn't invented in a lab. It was forged in the
            field — across $40 billion in technology transactions, stages from
            Harvard to Davos, and 25 years of watching teams succeed and fail
            for the same preventable reasons.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "25+", label: "Years of Research" },
            { value: "$40B", label: "Transactions Managed" },
            { value: "Harvard", label: "to Davos" },
            { value: "14", label: "Published Works" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-muted/20 border border-border/30">
              <span className="text-2xl md:text-3xl font-display font-bold text-primary">
                {stat.value}
              </span>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/30 to-primary/50" />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative flex items-start gap-6 pl-14">
                {/* Dot */}
                <div className={`absolute left-4 w-5 h-5 rounded-full ${m.color} ring-4 ring-background z-10`} />

                <div className="flex-1 p-5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-primary">
                      {m.year}
                    </span>
                    <span className={`text-xs font-mono uppercase tracking-wider ${categoryColors[m.category] || "text-muted-foreground"}`}>
                      {m.category}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <m.icon className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-display font-bold text-foreground text-lg mb-1">
                        {m.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {m.description}
                      </p>
                      {m.link && (
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-2 font-medium transition-colors"
                        >
                          Read the original
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
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
          <Zap className="w-10 h-10 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold mb-4">
            25 Years Led Here. 5 Minutes to Start.
          </h2>
          <p className="text-muted-foreground mb-8">
            The framework is ready. The assessment is live. Discover your role
            in the relay.
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

      <BlogBridge pageKey="science" />
    </div>
  );
}
