"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Heart, Zap, Scale, TrendingUp, TrendingDown, Equal, Share2 } from "lucide-react";
import BlogBridge from "@/components/BlogBridge";

const roles = ["Spark", "Amplifier", "Filter", "Ground", "Conductor"] as const;
type Role = (typeof roles)[number];

const roleColors: Record<Role, string> = {
  Spark: "text-yellow-400",
  Amplifier: "text-cyan-400",
  Filter: "text-rose-400",
  Ground: "text-emerald-400",
  Conductor: "text-purple-400",
};

const roleBgColors: Record<Role, string> = {
  Spark: "bg-yellow-400/10 border-yellow-400/20",
  Amplifier: "bg-cyan-400/10 border-cyan-400/20",
  Filter: "bg-rose-400/10 border-rose-400/20",
  Ground: "bg-emerald-400/10 border-emerald-400/20",
  Conductor: "bg-purple-400/10 border-purple-400/20",
};

const roleEmoji: Record<Role, string> = {
  Spark: "⚡",
  Amplifier: "📡",
  Filter: "🔬",
  Ground: "🏗️",
  Conductor: "🎯",
};

interface DynamicResult {
  category: "multiply" | "complement" | "tension" | "collision";
  title: string;
  description: string;
  energy: string;
  advice: string;
}

function calculateDynamic(role1: Role, role2: Role): DynamicResult {
  // Multiplication pairs — these roles amplify each other
  const multiplyPairs: [Role, Role][] = [
    ["Spark", "Amplifier"],
    ["Ground", "Conductor"],
    ["Filter", "Ground"],
  ];

  // Complementary pairs — these roles complete each other
  const complementPairs: [Role, Role][] = [
    ["Spark", "Ground"],
    ["Amplifier", "Filter"],
    ["Spark", "Conductor"],
    ["Amplifier", "Ground"],
    ["Filter", "Conductor"],
  ];

  // Tension pairs — these roles create productive friction
  const tensionPairs: [Role, Role][] = [
    ["Spark", "Filter"],
    ["Amplifier", "Conductor"],
  ];

  const isPair = (pairs: [Role, Role][]) =>
    pairs.some(
      ([a, b]) => (role1 === a && role2 === b) || (role1 === b && role2 === a)
    );

  if (role1 === role2) {
    return {
      category: "collision",
      title: "Mirror Match",
      description: `Two ${role1}s in the same space. You understand each other perfectly — which is both the gift and the danger. You'll finish each other's sentences and share each other's blind spots.`,
      energy: "Same wavelength, same blind spots. The circuit echoes but doesn't complete.",
      advice: `You need a ${role1 === "Spark" ? "Ground" : role1 === "Ground" ? "Spark" : role1 === "Filter" ? "Amplifier" : role1 === "Amplifier" ? "Filter" : "Spark"} between you to break the echo chamber. Without a counterweight, you'll reinforce each other's worst tendencies while celebrating each other's best.`,
    };
  }

  if (isPair(multiplyPairs)) {
    return {
      category: "multiply",
      title: "Energy Multiplier",
      description: `${role1} and ${role2} don't just add up — they multiply. The energy between you creates something neither of you could produce alone. This is the pairing that makes teams look like they have twice the headcount.`,
      energy: "Multiplicative. Your combined output exceeds the sum of your individual contributions.",
      advice: "Protect this pairing. Don't let organizational structure separate you. Schedule regular direct contact — not through intermediaries. The multiplication only works when the connection is live.",
    };
  }

  if (isPair(complementPairs)) {
    return {
      category: "complement",
      title: "Natural Complement",
      description: `${role1} and ${role2} complete each other's circuit. Where one has a gap, the other has a strength. This is the pairing that makes the relay actually work — the baton passes cleanly because you're built for different legs of the race.`,
      energy: "Additive with potential for multiplication. The more trust you build, the more the math shifts from addition to multiplication.",
      advice: "The key is mutual respect for what the other brings. The moment one role starts seeing the other as 'less important,' the complement breaks down into competition.",
    };
  }

  if (isPair(tensionPairs)) {
    return {
      category: "tension",
      title: "Productive Tension",
      description: `${role1} and ${role2} create friction — and that's not a bug, it's a feature. The tension between you is what prevents the team from shipping garbage (too much ${role1 === "Spark" ? "Spark" : "Amplifier"}) or shipping nothing (too much ${role1 === "Filter" ? "Filter" : "Conductor"}).`,
      energy: "Frictional but necessary. The heat generated is the quality control the team needs.",
      advice: "Don't try to eliminate the tension. Channel it. Create structured moments where the friction is expected and productive — design reviews, assumption audits, pre-mortems. The worst thing you can do is pretend you agree.",
    };
  }

  // Default fallback
  return {
    category: "complement",
    title: "Dynamic Pairing",
    description: `${role1} and ${role2} bring different energies to the relay. Your interaction style depends heavily on context — in some situations you'll complement each other beautifully, in others you'll need a Conductor to bridge the gap.`,
    energy: "Context-dependent. The quality of your pairing depends on the clarity of the handoff between you.",
    advice: "Invest in understanding each other's operating rhythm. When does the other person need space? When do they need signal? Map those patterns and you'll find the multiplication zone.",
  };
}

export default function RelationshipCalculator() {
  const [person1, setPerson1] = useState<{ name: string; role: Role | null }>({
    name: "",
    role: null,
  });
  const [person2, setPerson2] = useState<{ name: string; role: Role | null }>({
    name: "",
    role: null,
  });
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    if (person1.role && person2.role) {
      return calculateDynamic(person1.role, person2.role);
    }
    return null;
  }, [person1.role, person2.role]);

  const categoryIcons = {
    multiply: TrendingUp,
    complement: Equal,
    tension: Scale,
    collision: TrendingDown,
  };

  const categoryColors = {
    multiply: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    complement: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    tension: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    collision: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-8">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-mono text-rose-400">Energy Dynamics</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            The Relationship
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-purple-400">
              Calculator
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            "If your <em>us</em> doesn't equal more than you two separately, it
            just doesn't add up." Select two roles and discover whether you
            multiply, complement, or create productive tension.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Person 1 */}
            <div className="space-y-4">
              <label className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Person One
              </label>
              <input
                type="text"
                placeholder="Name (optional)"
                value={person1.name}
                onChange={(e) => setPerson1({ ...person1, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-1 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setPerson1({ ...person1, role });
                      setShowResult(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      person1.role === role
                        ? roleBgColors[role] + " ring-1 ring-current"
                        : "border-border/30 hover:border-border/60 bg-card/30"
                    }`}
                  >
                    <span className="text-xl">{roleEmoji[role]}</span>
                    <span
                      className={`font-display font-semibold ${
                        person1.role === role ? roleColors[role] : "text-foreground"
                      }`}
                    >
                      {role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Person 2 */}
            <div className="space-y-4">
              <label className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                Person Two
              </label>
              <input
                type="text"
                placeholder="Name (optional)"
                value={person2.name}
                onChange={(e) => setPerson2({ ...person2, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
              />
              <div className="grid grid-cols-1 gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setPerson2({ ...person2, role });
                      setShowResult(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      person2.role === role
                        ? roleBgColors[role] + " ring-1 ring-current"
                        : "border-border/30 hover:border-border/60 bg-card/30"
                    }`}
                  >
                    <span className="text-xl">{roleEmoji[role]}</span>
                    <span
                      className={`font-display font-semibold ${
                        person2.role === role ? roleColors[role] : "text-foreground"
                      }`}
                    >
                      {role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="text-center mt-10">
            <Button
              size="lg"
              onClick={() => setShowResult(true)}
              disabled={!person1.role || !person2.role}
              className="bg-gradient-to-r from-rose-500 to-purple-500 text-white hover:from-rose-400 hover:to-purple-400 font-bold shadow-lg px-10"
            >
              <Scale className="mr-2 w-5 h-5" />
              Calculate Your Dynamic
            </Button>
          </div>

          {/* Result */}
          {showResult && result && person1.role && person2.role && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div
                className={`p-8 rounded-2xl border ${categoryColors[result.category]}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  {(() => {
                    const Icon = categoryIcons[result.category];
                    return <Icon className="w-8 h-8" />;
                  })()}
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider opacity-70">
                      {result.category === "multiply"
                        ? "Multiplicative"
                        : result.category === "complement"
                        ? "Complementary"
                        : result.category === "tension"
                        ? "Productive Friction"
                        : "Mirror Match"}
                    </span>
                    <h3 className="text-2xl font-display font-bold">
                      {person1.name || person1.role} + {person2.name || person2.role}:{" "}
                      {result.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider opacity-70 mb-2">
                      The Dynamic
                    </h4>
                    <p className="text-foreground leading-relaxed">
                      {result.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider opacity-70 mb-2">
                      Energy Equation
                    </h4>
                    <p className="text-foreground leading-relaxed">{result.energy}</p>
                  </div>

                  <div className="p-5 rounded-xl bg-background/50 border border-border/30">
                    <h4 className="text-sm font-mono uppercase tracking-wider text-primary mb-2">
                      The Advice
                    </h4>
                    <p className="text-foreground leading-relaxed font-medium">
                      {result.advice}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/assessment">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold">
                      Don't Know Your Role? Take the Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = `${person1.name || person1.role} (${person1.role}) + ${person2.name || person2.role} (${person2.role}) = ${result.title}. Try the Relationship Calculator at The Flow Circuit!`;
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    <Share2 className="mr-2 w-4 h-4" />
                    Share Result
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Context */}
      <section className="py-20 px-4 mt-8">
        <div className="max-w-3xl mx-auto">
          <blockquote className="text-xl md:text-2xl text-center text-muted-foreground italic leading-relaxed">
            "If your <em>us</em> doesn't equal more than you two separately, it
            just doesn't add up."
          </blockquote>
          <p className="text-center text-sm text-muted-foreground mt-4">
            — Tony Greenberg,{" "}
            <a
              href="https://tonygreenberg.com/the-arithmetic-of-relationships-whats-our-mutual-net-profit/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              The Arithmetic of Relationships
            </a>
          </p>
        </div>
      </section>

      <BlogBridge pageKey="results" />
    </div>
  );
}
