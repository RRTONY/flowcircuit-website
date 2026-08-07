"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles, Brain, Eye, Compass, Flame, Star,
  ArrowRight, CheckCircle2, Lock, Users, Zap,
  Heart, Shield, ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Tier = "blueprint" | "compass" | "oracle";
type ReportType = "soulprint_only" | "combined";

interface TierInfo {
  id: Tier;
  name: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgGradient: string;
  frameworks: string[];
  vibe: string;
}

const tiers: TierInfo[] = [
  {
    id: "blueprint",
    name: "The Blueprint",
    tagline: "What you can measure. What you can't hide from.",
    description:
      "Behavioral psychology, neuroscience-backed personality patterns, cognitive tendencies, and Enneagram core type. The empirical layer of your operating system — grounded in science, stripped of mysticism.",
    icon: <Brain className="w-7 h-7" />,
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgGradient: "from-blue-950/40 to-blue-900/20",
    frameworks: ["Enneagram", "Behavioral Psychology", "Cognitive Patterns", "Neuroscience"],
    vibe: "Science-driven. Grounded. Empirical.",
  },
  {
    id: "compass",
    name: "The Compass",
    tagline: "The symbolic layer — for reflection, not proof.",
    description:
      "Human Design type and authority, Western Astrology sun/moon/rising, and Numerology life path. These are interpretive, belief-based frameworks without peer-reviewed predictive validity — presented here as a lens for self-reflection, in plain language.",
    icon: <Compass className="w-7 h-7" />,
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgGradient: "from-purple-950/40 to-purple-900/20",
    frameworks: ["Human Design", "Western Astrology", "Numerology", "Chinese Astrology"],
    vibe: "Symbolic. Accessible. For fun.",
  },
  {
    id: "oracle",
    name: "The Oracle",
    tagline: "The thing your soul has been trying to tell you.",
    description:
      "Gene Keys profile, Vedic astrology (Jyotish), Spiral Dynamics level, shadow work integration, karmic patterns, and soul purpose narrative. This is the deep dive — where science ends and soul begins.",
    icon: <Eye className="w-7 h-7" />,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgGradient: "from-amber-950/40 to-amber-900/20",
    frameworks: ["Gene Keys", "Vedic Astrology", "Spiral Dynamics", "Shadow Work", "Karmic Patterns"],
    vibe: "Deeply spiritual. Transformational.",
  },
];

export default function SoulPrintClient({ orderId }: { orderId?: string }) {
  const [selectedTier, setSelectedTier] = useState<Tier>("compass");
  const [reportType, setReportType] = useState<ReportType>("combined");
  const [showForm, setShowForm] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();


  const alphaCountQuery = trpc.soulprint.alphaCount.useQuery();
  const alphaRemaining = useMemo(() => {
    const count = alphaCountQuery.data?.count ?? 0;
    return Math.max(0, 1000 - count);
  }, [alphaCountQuery.data]);
  const isAlpha = alphaRemaining > 0;

  const createOrder = trpc.soulprint.createOrder.useMutation({
    onSuccess: (data: { checkoutUrl: string | null; orderId: number }) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        toast.info("Redirecting to checkout", {
          description: "A new tab is opening with your secure payment page.",
        });
      } else {
        toast.success("SoulPrint order created", {
          description: "You're one of our first 1,000 explorers. Your report is being generated.",
        });
        router.push(`/soulprint/report/${data.orderId}`);
      }
    },
    onError: (error: { message: string }) => {
      toast.error("Something went wrong", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !birthCity) {
      toast.error("Missing birth data", {
        description: "We need at least your birth date and birth city to generate your SoulPrint.",
      });
      return;
    }

    createOrder.mutate({
      tier: selectedTier,
      reportType,
      birthDate,
      birthTime: birthTime || undefined,
      birthCity,
      name: name || user?.name || undefined,
      email: email || user?.email || undefined,
      origin: window.location.origin,
    });
  };

  const selectedTierInfo = tiers.find((t) => t.id === selectedTier)!;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-black to-black" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-amber-600 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Powered by TrueSelf &times; The Flow Circuit</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
              Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400">
                SoulPrint
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed" style={{ textWrap: 'balance' as any }}>
              Your Flow Circuit reveals <strong className="text-white">how</strong> you operate.
              <br />
              Your SoulPrint reveals <strong className="text-white">why you can't stop</strong>.
            </p>

            <p className="text-base text-gray-500 max-w-xl mx-auto mb-6">
              8 ancient + modern frameworks. One AI-synthesized portrait of your soul's operating system,
              rendered in language you can finally understand.
            </p>

            <p className="text-xs text-purple-300/70 max-w-xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-full px-4 py-2 inline-block">
              A just-for-fun, optional add-on — separate from your Flow Circuit assessment and its research
              basis. Astrology, Human Design, and Numerology don't have peer-reviewed empirical support;
              treat this as reflective entertainment, not a scientific reading.
            </p>

            {isAlpha && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-5 py-2 text-sm text-green-400 mb-8"
              >
                <Flame className="w-4 h-4 text-green-400" />
                <span>
                  <strong>{alphaRemaining}</strong> free alpha spots remaining — you're early
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
              Choose Your Lens
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Same soul. Same data. Different language. Pick the framing that speaks to you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <button
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                    selectedTier === tier.id
                      ? `${tier.borderColor} bg-gradient-to-br ${tier.bgGradient} shadow-lg shadow-${tier.id === 'blueprint' ? 'blue' : tier.id === 'compass' ? 'purple' : 'amber'}-500/10`
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${tier.color}`}>{tier.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold">{tier.name}</h3>
                      <p className="text-xs text-gray-500 italic">{tier.vibe}</p>
                    </div>
                    {selectedTier === tier.id && (
                      <CheckCircle2 className={`w-5 h-5 ml-auto ${tier.color}`} />
                    )}
                  </div>

                  <p className="text-sm text-gray-400 mb-4 leading-relaxed italic">
                    "{tier.tagline}"
                  </p>

                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {tier.frameworks.map((fw) => (
                      <span
                        key={fw}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          selectedTier === tier.id
                            ? `${tier.borderColor} ${tier.color}`
                            : "border-white/10 text-gray-600"
                        }`}
                      >
                        {fw}
                      </span>
                    ))}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Type Selection */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black tracking-tight text-center mb-8">
            Choose Your Report
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => setReportType("combined")}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                reportType === "combined"
                  ? "border-purple-500/50 bg-purple-950/30"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-lg">+</span>
                <Sparkles className="w-5 h-5 text-purple-400" />
                {reportType === "combined" && (
                  <CheckCircle2 className="w-5 h-5 ml-auto text-purple-400" />
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">The Complete Human Blueprint</h3>
              <p className="text-sm text-gray-500 mb-3">
                Flow Circuit DNA + SoulPrint Soul — a unified report showing how your team role maps to your soul's design.
              </p>
              <div className="flex items-baseline gap-2">
                {isAlpha ? (
                  <>
                    <span className="text-2xl font-black text-green-400">Free</span>
                    <span className="text-sm text-gray-600 line-through">$44</span>
                    <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Alpha</span>
                  </>
                ) : (
                  <span className="text-2xl font-black">$44</span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 mt-1 italic">Requires Flow Circuit assessment</p>
            </button>

            <button
              onClick={() => setReportType("soulprint_only")}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                reportType === "soulprint_only"
                  ? "border-amber-500/50 bg-amber-950/30"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {reportType === "soulprint_only" && (
                  <CheckCircle2 className="w-5 h-5 ml-auto text-amber-400" />
                )}
              </div>
              <h3 className="text-lg font-bold mb-1">SoulPrint Only</h3>
              <p className="text-sm text-gray-500 mb-3">
                Your soul's architecture across 8 frameworks — without the team dynamics layer. Pure self-knowledge.
              </p>
              <div className="flex items-baseline gap-2">
                {isAlpha ? (
                  <>
                    <span className="text-2xl font-black text-green-400">Free</span>
                    <span className="text-sm text-gray-600 line-through">$44</span>
                    <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">Alpha</span>
                  </>
                ) : (
                  <span className="text-2xl font-black">$44</span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 mt-1 italic">Priceless in value. $44 is the cover charge.</p>
            </button>
          </div>
        </div>
      </section>

      {/* What You'll Discover */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight text-center mb-12">
            What Your SoulPrint Reveals
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Star className="w-5 h-5" />, title: "Your Archetypes", desc: "Primary, secondary, shadow, and aspiring — the four faces of your soul's expression." },
              { icon: <Compass className="w-5 h-5" />, title: "Your Golden Path", desc: "The life trajectory your design is optimized for — when you stop fighting your nature." },
              { icon: <Shield className="w-5 h-5" />, title: "Your Shadow Pattern", desc: "The thing that trips you up every time. The grey path you default to under stress." },
              { icon: <Heart className="w-5 h-5" />, title: "Relationship Design", desc: "How your soul's architecture shapes who you attract, repel, and transform." },
              { icon: <Flame className="w-5 h-5" />, title: "Wealth Alignment", desc: "Your natural abundance pattern — how your design wants to generate and hold resources." },
              { icon: <Brain className="w-5 h-5" />, title: "Soul Purpose", desc: "A 2,000+ word narrative synthesizing all 8 frameworks into one coherent life instruction." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl border border-white/10 bg-white/[0.02]"
              >
                <div className="text-purple-400 mb-3">{item.icon}</div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Birth Data Form */}
      <section className="py-16 px-4" id="order">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-white/10">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${
                    selectedTier === 'blueprint' ? 'from-blue-500 to-blue-700' :
                    selectedTier === 'compass' ? 'from-purple-500 to-violet-700' :
                    'from-amber-500 to-orange-700'
                  } mb-4`}>
                    {selectedTierInfo.icon}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight mb-1">
                    {selectedTierInfo.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {reportType === "combined" ? "Complete Human Blueprint" : "SoulPrint Only"} &middot;{" "}
                    {isAlpha ? (
                      <span className="text-green-400 font-bold">Free (Alpha)</span>
                    ) : (
                      <span className="font-bold">$44</span>
                    )}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!isAuthenticated && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-400 text-sm">Your Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-400 text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-gray-400 text-sm">
                      Birth Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthTime" className="text-gray-400 text-sm">
                      Birth Time <span className="text-gray-600">(optional but recommended)</span>
                    </Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
                    />
                    <p className="text-[10px] text-gray-600">
                      Birth time dramatically improves Human Design and Astrology accuracy. Check your birth certificate.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthCity" className="text-gray-400 text-sm">
                      Birth City <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="birthCity"
                      value={birthCity}
                      onChange={(e) => setBirthCity(e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={createOrder.isPending}
                      className={`w-full py-6 text-lg font-bold tracking-wide gap-2 ${
                        isAlpha
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                          : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
                      }`}
                    >
                      {createOrder.isPending ? (
                        "Processing..."
                      ) : isAlpha ? (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Generate My SoulPrint — Free
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          Get My SoulPrint — $44
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 pt-2">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Secure
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Private
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> No data sold
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black tracking-tight mb-12">How It Works</h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Birth Data", desc: "Date, time (if known), and city of birth. That's all we need." },
              { step: "02", title: "AI Synthesis", desc: "8 frameworks are calculated and woven together by generative AI into a cohesive narrative." },
              { step: "03", title: "Your Report", desc: "A 12,000+ word portrait of your soul's architecture — archetypes, purpose, shadows, and golden path." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-black text-white/10 mb-3">{item.step}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Combined Report Preview */}
      {reportType === "combined" && (
        <section className="py-16 px-4 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-center mb-4">
              The Synthesis No One Else Can Build
            </h2>
            <p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">
              When your Flow Circuit DNA meets your SoulPrint, something new emerges — a section that exists only in the combined report.
            </p>

            <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/20">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-purple-300 mb-4">
                  Sample Synthesis: Where DNA Meets Soul
                </h3>
                <blockquote className="text-gray-400 leading-relaxed italic border-l-2 border-purple-500/40 pl-4 space-y-4">
                  <p>
                    "Your Spark role isn't a career choice — it's a soul instruction. Your Manifesting Generator design means you were literally built to respond to creative impulses with sacral energy. When organizations put you in a Filter role, they're not just misusing your talent — they're fighting your soul's architecture."
                  </p>
                  <p>
                    "The cortisol spike you feel in those moments isn't just stress. It's your entire being screaming that you're broadcasting on the wrong frequency."
                  </p>
                  <p>
                    "Your Gene Key 55 shadow of Victimization maps precisely to what happens when a Spark is grounded against their will. The gift of Freedom emerges when you find a team that lets you be the Spark — and your Flow Circuit assessment just told you exactly which team composition makes that possible."
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Stop Guessing. Start Knowing.
          </h2>
          <p className="text-gray-500 mb-8">
            {isAlpha
              ? `${alphaRemaining} free alpha spots left. After that, it's $44. The value is priceless — the price is a cover charge.`
              : "Your SoulPrint is waiting. $44 is the cover charge. The value is priceless."}
          </p>
          <Button
            onClick={() => {
              document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 px-10 py-6 text-lg font-bold gap-2"
          >
            <Sparkles className="w-5 h-5" />
            {isAlpha ? "Get Your Free SoulPrint" : "Get Your SoulPrint — $44"}
          </Button>
        </div>
      </section>

      {/* Footer Attribution */}
      <div className="text-center text-xs text-gray-700 pb-8 px-4">
        <p>
          SoulPrint is powered by{" "}
          <a href="https://soulprint.trueself.io" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline">
            TrueSelf
          </a>{" "}
          (Max Marmer) in partnership with{" "}
          <a href="/" className="text-purple-500 hover:text-purple-400 underline">
            The Flow Circuit
          </a>{" "}
          (Tony Greenberg).
        </p>
        <p className="mt-1">
          Birth data is encrypted and never sold. AI is used to mirror, not monitor.
        </p>
      </div>
    </div>
  );
}
