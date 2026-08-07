import { ExternalLink, BookOpen } from "lucide-react";

interface BlogArticle {
  title: string;
  url: string;
  connection: string;
  year?: string;
}

const BLOG_MAP: Record<string, BlogArticle[]> = {
  science: [
    {
      title: "Human Operating System",
      url: "https://tonygreenberg.com/human-operating-system/",
      connection: "The origin essay — why technology must fit human wiring, not the reverse.",
      year: "2015",
    },
    {
      title: "10 Magic Questions to Make Your Project Go Right",
      url: "https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/",
      connection: "Names the Z Process by name: Creator → Advancer → Refiner → Executor → Flexer.",
      year: "2014",
    },
    {
      title: "Boiling the Human — H+ Summit at Harvard",
      url: "https://tonygreenberg.com/boiling-the-human-h-summit-transcript-harvard-kurzweil/",
      connection: "Tony on stage with Kurzweil arguing exponential tech needs a human OS.",
      year: "2010",
    },
  ],
  protocol: [
    {
      title: "10 Magic Questions to Make Your Project Go Right",
      url: "https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/",
      connection: "The original relay framework: Creator → Advancer → Refiner → Executor.",
      year: "2014",
    },
    {
      title: "The Decay of Modern Day Communication",
      url: "https://tonygreenberg.com/the-decay-of-modern-day-communication/",
      connection: "What happens when the relay breaks — ghosting, accountability collapse.",
      year: "2024",
    },
    {
      title: "Mastering Human and Business Development",
      url: "https://tonygreenberg.com/mastering-human-and-business-development/",
      connection: "The Conductor's operating manual — orchestrating energy between people.",
      year: "2020",
    },
  ],
  results: [
    {
      title: "The Arithmetic of Relationships",
      url: "https://tonygreenberg.com/the-arithmetic-of-relationships-whats-our-mutual-net-profit/",
      connection: "If your 'us' doesn't equal more than you two separately, it doesn't add up.",
      year: "2010",
    },
    {
      title: "Trust Us? Are You Really My Friend?",
      url: "https://tonygreenberg.com/trust-us-are-you-really-my-friend/",
      connection: "Trust as the foundation — without it, no relay can function.",
      year: "2015",
    },
  ],
  home: [
    {
      title: "Human Operating System",
      url: "https://tonygreenberg.com/human-operating-system/",
      connection: "Where it all started — the vision of technology that fits human wiring.",
      year: "2015",
    },
    {
      title: "Save the Entrepreneur",
      url: "https://tonygreenberg.com/save-the-entrepreneur-big-business-keeps-buying-startups-and-killing-em/",
      connection: "When big business kills the Spark — the problem The Flow Circuit solves.",
      year: "2014",
    },
  ],
  soulprint: [
    {
      title: "From Supply Chain to the Blockchain: Heal the Body, Mind, & Earth",
      url: "https://tonygreenberg.com/from-supply-chain-to-the-blockchain-heal-the-body-mind-earth/",
      connection: "ImpactSoul — the spiritual ancestor of the SoulPrint integration.",
      year: "2018",
    },
    {
      title: "Elixir of Life Device and Journey",
      url: "https://tonygreenberg.com/elixir-of-life-device-and-journey/",
      connection: "The deeply spiritual dimension — ceremony, breath, the veil between worlds.",
      year: "2025",
    },
  ],
  bio: [
    {
      title: "Boiling the Human — H+ Summit at Harvard",
      url: "https://tonygreenberg.com/boiling-the-human-h-summit-transcript-harvard-kurzweil/",
      connection: "Tony on the same stage as Kurzweil, arguing for a human operating system.",
      year: "2010",
    },
    {
      title: "Davos 2022 — World Economic Forum",
      url: "https://tonygreenberg.com/davos-2022-world-economic-forum/",
      connection: "Global leadership stage — the scale at which this framework operates.",
      year: "2022",
    },
    {
      title: "Marc Andreessen Rebuttal",
      url: "https://tonygreenberg.com/marc-andreessen-rebuttal-2020/",
      connection: "Calling out the gap between what tech leaders say and what they do.",
      year: "2020",
    },
  ],
  journey: [
    {
      title: "Mastering Human and Business Development",
      url: "https://tonygreenberg.com/mastering-human-and-business-development/",
      connection: "The Triangle of Trust — mind meld, audit, friendly guidance, social impact.",
      year: "2020",
    },
    {
      title: "The Tug of War — Ethical vs. Economic Decisions",
      url: "https://tonygreenberg.com/the-tug-of-war-ethical-vs-economic-decisions/",
      connection: "The Filter role in real-time — when quality control collides with speed.",
      year: "2015",
    },
  ],
  "team-builder": [
    {
      title: "The Arithmetic of Relationships",
      url: "https://tonygreenberg.com/the-arithmetic-of-relationships-whats-our-mutual-net-profit/",
      connection: "Energy givers vs. energy takers — multiplication vs. addition in teams.",
      year: "2010",
    },
    {
      title: "10 Magic Questions to Make Your Project Go Right",
      url: "https://tonygreenberg.com/10-magic-questions-to-make-your-project-go-right-how-to-kick-ass-by-kicking-assumptions/",
      connection: "The original project alignment framework that became The Flow Circuit.",
      year: "2014",
    },
  ],
  inspirations: [
    {
      title: "Human Operating System",
      url: "https://tonygreenberg.com/human-operating-system/",
      connection: "The essay that synthesized decades of research into a single vision.",
      year: "2015",
    },
    {
      title: "6 Act of Speech: Speaking As a Tool",
      url: "https://tonygreenberg.com/6-act-of-speech-speaking-as-a-tool/",
      connection: "Communication as craft — the Conductor's essential toolkit.",
      year: "2015",
    },
  ],
};

interface BlogBridgeProps {
  pageKey: string;
  className?: string;
}

export default function BlogBridge({ pageKey, className = "" }: BlogBridgeProps) {
  const articles = BLOG_MAP[pageKey];
  if (!articles || articles.length === 0) return null;

  return (
    <section className={`relative z-10 py-16 ${className}`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-display font-bold text-foreground">
            From the Archives
          </h3>
        </div>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          The Flow Circuit didn't appear overnight. These articles from
          tonygreenberg.com trace the intellectual journey that led here.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-5 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {article.year}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
                {article.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.connection}
              </p>
            </a>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="https://tonygreenberg.com/blog/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Explore the full archive on tonygreenberg.com
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
