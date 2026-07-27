"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Users, Sparkles, Brain, Compass, Star, Moon,
  ChevronDown, ChevronUp, Shield, Flame, Heart, Zap,
  Activity, Anchor, Radio, Lock, Unlock, AlertTriangle,
  BookOpen, ExternalLink, TrendingUp, Award, Building2
} from "lucide-react";
import { toast } from "sonner";

// ─── Enneagram → Flow Circuit Role Cross-Reference ─────────────────────────
const enneagramToFlowCircuit: Record<string, {
  primaryRole: string;
  secondaryRole: string;
  resonance: string;
  insight: string;
}> = {
  "1": { primaryRole: "Filter", secondaryRole: "Ground", resonance: "Quality guardian — your perfectionism is the Filter's superpower", insight: "Your inner critic is actually a finely-tuned quality sensor. In Flow Circuit terms, you're the team's immune system." },
  "2": { primaryRole: "Amplifier", secondaryRole: "Conductor", resonance: "Relational catalyst — you amplify others' potential", insight: "Your drive to help is the Amplifier's gift. You make everyone around you perform at a higher level." },
  "3": { primaryRole: "Spark", secondaryRole: "Amplifier", resonance: "Achievement engine — you ignite and accelerate", insight: "Your adaptability and drive make you a natural Spark. You see possibilities and make them real." },
  "4": { primaryRole: "Spark", secondaryRole: "Filter", resonance: "Creative visionary — you see what's missing and create it", insight: "Your emotional depth fuels original thinking. The Spark needs your ability to see beneath the surface." },
  "5": { primaryRole: "Filter", secondaryRole: "Ground", resonance: "Knowledge architect — you build the intellectual foundation", insight: "Your analytical depth is the Filter's precision instrument. You see patterns others miss." },
  "6": { primaryRole: "Ground", secondaryRole: "Filter", resonance: "Stability anchor — you anticipate and prepare", insight: "Your vigilance is the Ground's gift. You hold the team steady when others lose their footing." },
  "7": { primaryRole: "Spark", secondaryRole: "Amplifier", resonance: "Innovation catalyst — you generate and energize", insight: "Your enthusiasm is pure Spark energy. You see connections and possibilities everywhere." },
  "8": { primaryRole: "Conductor", secondaryRole: "Ground", resonance: "Power orchestrator — you direct and protect", insight: "Your natural authority is the Conductor's instrument. You create the space for others to perform." },
  "9": { primaryRole: "Ground", secondaryRole: "Amplifier", resonance: "Harmony architect — you hold the center", insight: "Your ability to see all perspectives is the Ground's wisdom. You're the team's gravitational center." },
};

const topicConfig: Record<string, { icon: any; label: string; color: string; glowColor: string; description: string }> = {
  enneagram: { icon: Brain, label: "Enneagram", color: "text-violet-400", glowColor: "shadow-violet-500/20", description: "Your core personality architecture — drives, fears, and growth paths" },
  human_design: { icon: Compass, label: "Human Design", color: "text-emerald-400", glowColor: "shadow-emerald-500/20", description: "Your energetic blueprint — strategy, authority, and life force type" },
  western_astrology: { icon: Star, label: "Western Astrology", color: "text-amber-400", glowColor: "shadow-amber-500/20", description: "Your celestial map — planetary positions and cosmic influences" },
  chinese_astrology: { icon: Moon, label: "Chinese Astrology", color: "text-red-400", glowColor: "shadow-red-500/20", description: "Your elemental nature — animal signs and five-element harmony" },
  numerology: { icon: Sparkles, label: "Numerology", color: "text-cyan-400", glowColor: "shadow-cyan-500/20", description: "Your numerical signature — life path, expression, and soul urge" },
  soulprint_combinations: { icon: Heart, label: "Soulprint Synthesis", color: "text-pink-400", glowColor: "shadow-pink-500/20", description: "Where all systems converge — your unique cross-system patterns" },
};

const roleIcons: Record<string, any> = {
  Spark: Zap, Amplifier: Activity, Filter: Shield, Ground: Anchor, Conductor: Radio,
};

const evidenceData = [
  { company: "SAP", stat: "200% ROI", detail: "Global mindfulness & self-awareness program", source: "Reuters, 2018", icon: TrendingUp },
  { company: "Aetna", stat: "$9M Saved", detail: "Healthcare costs reduced 7% through consciousness practices", source: "Fierce Healthcare, 2015", icon: Building2 },
  { company: "Google", stat: "SIY Program", detail: "Search Inside Yourself — neuroscience + mindfulness + EI", source: "SIY Global", icon: Brain },
  { company: "Intel", stat: "+10% Performance", detail: "Awake@Intel: 12% focus increase, stress reduction", source: "Intel Internal Studies", icon: Award },
  { company: "Fortune 500", stat: "80% Adoption", detail: "Over 80M personality assessments administered annually", source: "Fortune, 2025", icon: Users },
  { company: "Dutch Gaming Co.", stat: "0% Attrition", detail: "Enneagram-trained teams: zero departures vs high turnover", source: "Truity, 2024", icon: Shield },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function parseSections(data: any[]) {
  if (!Array.isArray(data)) return [];
  return data
    .filter(s => s.topic && s.topic !== "dashboard" && s.topic !== "dashboard_clone")
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map(s => ({
      topic: s.topic,
      title: s.title || s.subtitle || s.topic,
      subtitle: s.subtitle,
      blocks: (s.blocks || []).sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0)),
    }));
}

function getSynthesis(data: any[]): string {
  if (!Array.isArray(data)) return "";
  const d = data.find(s => s.topic === "dashboard_clone");
  return d?.blocks?.[0]?.text || "";
}

function getEnneagramNum(data: any[]): string | null {
  if (!Array.isArray(data)) return null;
  const e = data.find(s => s.topic === "enneagram");
  const title = e?.blocks?.[0]?.title;
  if (!title) return null;
  const map: Record<string, string> = {
    reformer: "1", perfectionist: "1", helper: "2", giver: "2",
    achiever: "3", performer: "3", individualist: "4", romantic: "4",
    investigator: "5", observer: "5", loyalist: "6", skeptic: "6",
    enthusiast: "7", epicure: "7", challenger: "8", protector: "8",
    peacemaker: "9", mediator: "9",
  };
  const lower = title.toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

function BlockText({ block }: { block: any }) {
  if (!block.text) return null;
  if (Array.isArray(block.text)) {
    return (
      <div className="space-y-3">
        {block.text.map((t: string, i: number) => (
          <p key={i} className="text-white/75 leading-relaxed text-sm">{t}</p>
        ))}
      </div>
    );
  }
  return <p className="text-white/75 leading-relaxed text-sm whitespace-pre-line">{block.text}</p>;
}

// ─── Section Accordion ─────────────────────────────────────────────────────
function Section({ section }: { section: { topic: string; title: string; subtitle?: string; blocks: any[] } }) {
  const [open, setOpen] = useState(false);
  const cfg = topicConfig[section.topic] || { icon: Sparkles, label: section.topic, color: "text-white", glowColor: "", description: "" };
  const Icon = cfg.icon;
  const visible = section.blocks.filter(b => b.title || b.text);
  const preview = visible.slice(0, 2);
  const rest = visible.slice(2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${cfg.glowColor} blur-3xl -z-10`} />
        <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-6 text-left">
          <div className={`p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] ${cfg.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold ${cfg.color}`}>{cfg.label}</h3>
            <p className="text-white/50 text-sm mt-0.5">{cfg.description}</p>
          </div>
          <div className="text-white/40">
            {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        <div className="px-6 pb-4 space-y-4">
          {preview.map((block, i) => (
            <div key={block.id || i}>
              {block.title && <h4 className="text-white/90 font-medium text-sm mb-1.5">{block.title}</h4>}
              <BlockText block={block} />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {open && rest.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 space-y-5 border-t border-white/[0.06] pt-4">
                {rest.map((block, i) => (
                  <div key={block.id || i}>
                    {block.title && <h4 className="text-white/90 font-medium text-sm mb-1.5">{block.title}</h4>}
                    <BlockText block={block} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!open && rest.length > 0 && (
          <div className="px-6 pb-4">
            <button onClick={() => setOpen(true)} className="text-xs text-white/40 hover:text-white/60 transition-colors">
              + {rest.length} more sections
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Consent Dialog ────────────────────────────────────────────────────────
function ConsentDialog({ onConsent }: { onConsent: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6"
    >
      <div className="max-w-lg w-full">
        <div className="relative rounded-3xl overflow-hidden backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] p-8">
          {/* Ambient glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1]">
              <Eye className="w-8 h-8 text-violet-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Want to See Your Deeper Reading?
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Your SoulPrint is a consciousness layer that sits alongside your Flow Circuit profile.
                It draws from ancient wisdom systems — Enneagram, Human Design, Astrology, Numerology —
                to reveal patterns that sometimes adjust you to an even more natural state.
              </p>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06] text-left">
              <p className="text-white/50 text-xs leading-relaxed">
                This reading is separate from your Flow Circuit assessment. You can toggle it on or off
                at any time, and choose whether to share it with your team. Your Flow Circuit role
                remains your primary identity — this is an optional deeper lens.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]"
                onClick={() => window.history.back()}
              >
                Not Now
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
                onClick={onConsent}
              >
                <Eye className="w-4 h-4 mr-2" />
                Show My Reading
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Cross-Reference Card ──────────────────────────────────────────────────
function CrossReferenceCard({ enneagramNum, flowRole }: { enneagramNum: string; flowRole?: string }) {
  const mapping = enneagramToFlowCircuit[enneagramNum];
  if (!mapping) return null;

  const PrimaryIcon = roleIcons[mapping.primaryRole] || Zap;
  const SecondaryIcon = roleIcons[mapping.secondaryRole] || Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.08] border border-white/[0.1] p-6">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.1]">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Enneagram × Flow Circuit</h3>
              <p className="text-white/50 text-xs">Where consciousness meets team dynamics</p>
            </div>
          </div>

          <p className="text-white/70 text-sm mb-4">{mapping.resonance}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <PrimaryIcon className="w-4 h-4 text-amber-400" />
                <span className="text-white/90 text-xs font-medium">Primary Resonance</span>
              </div>
              <p className="text-white/60 text-sm font-semibold">{mapping.primaryRole}</p>
            </div>
            <div className="bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <SecondaryIcon className="w-4 h-4 text-emerald-400" />
                <span className="text-white/90 text-xs font-medium">Secondary Resonance</span>
              </div>
              <p className="text-white/60 text-sm font-semibold">{mapping.secondaryRole}</p>
            </div>
          </div>

          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-white/60 text-sm italic leading-relaxed">{mapping.insight}</p>
          </div>

          {flowRole && flowRole !== mapping.primaryRole && (
            <div className="mt-3 bg-amber-500/[0.08] rounded-xl p-3 border border-amber-500/20">
              <p className="text-amber-300/80 text-xs">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Your Flow Circuit role ({flowRole}) differs from the Enneagram prediction ({mapping.primaryRole}).
                This tension can be a source of creative power — you operate in a space most people don't.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function SoulPrintLayerClient({ assessmentId: assessmentIdProp }: { assessmentId?: string }) {
  const router = useRouter();

  // Get assessmentId from route or localStorage
  const assessmentId = assessmentIdProp
    ? parseInt(assessmentIdProp)
    : (() => {
        try {
          const stored = localStorage.getItem("flowcircuit_assessment_id");
          return stored ? parseInt(stored) : null;
        } catch { return null; }
      })();

  const [consented, setConsented] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  // Fetch soulprint profile
  const { data: profile, isLoading } = trpc.soulprintLayer.getByAssessment.useQuery(
    { assessmentId: assessmentId! },
    { enabled: !!assessmentId }
  );

  const consentMutation = trpc.soulprintLayer.giveConsent.useMutation({
    onSuccess: () => {
      setConsented(true);
      toast.success("Consciousness layer activated");
    },
  });

  const toggleEnabledMutation = trpc.soulprintLayer.toggleEnabled.useMutation({
    onSuccess: () => toast.success("Visibility updated"),
  });

  const toggleTeamMutation = trpc.soulprintLayer.toggleTeamView.useMutation({
    onSuccess: () => toast.success("Team visibility updated"),
  });

  // Parse the data
  const soulprintData = profile?.soulprintData as any[] | null;
  const sections = useMemo(() => parseSections(soulprintData || []), [soulprintData]);
  const synthesis = useMemo(() => getSynthesis(soulprintData || []), [soulprintData]);
  const enneagramNum = useMemo(() => getEnneagramNum(soulprintData || []), [soulprintData]);

  // Get flow circuit role from localStorage
  const flowRole = (() => {
    try {
      const stored = localStorage.getItem("flowcircuit_role");
      return stored || undefined;
    } catch { return undefined; }
  })();

  const hasConsented = profile?.consentGiven || consented;
  const isEnabled = profile?.enabled ?? false;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="w-8 h-8 text-violet-400" />
        </motion.div>
      </div>
    );
  }

  // No profile found
  if (!profile || !soulprintData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <Lock className="w-12 h-12 text-white/20 mx-auto" />
          <h2 className="text-xl font-bold text-white">No SoulPrint Reading Available</h2>
          <p className="text-white/50 text-sm">
            Complete your Flow Circuit assessment first, then connect your SoulPrint
            to unlock the consciousness layer.
          </p>
          <Button
            variant="outline"
            className="border-white/10 text-white/60 hover:text-white"
            onClick={() => router.push("/soulprint")}
          >
            Get Your SoulPrint
          </Button>
        </div>
      </div>
    );
  }

  // Consent gate
  if (!hasConsented) {
    return (
      <ConsentDialog
        onConsent={() => {
          if (profile.id) {
            consentMutation.mutate({ id: profile.id, consent: true });
          } else {
            setConsented(true);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6">
            <Eye className="w-4 h-4 text-violet-400" />
            <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Consciousness Layer</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">SoulPrint</span>
          </h1>

          <p className="text-white/50 text-sm max-w-lg mx-auto leading-relaxed">
            A deeper lens on who you are. This reading sits alongside your Flow Circuit profile —
            toggle it in or out at any time.
          </p>
        </motion.div>

        {/* Toggle Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      if (profile.id) toggleEnabledMutation.mutate({ id: profile.id, enabled: checked });
                    }}
                  />
                  <div>
                    <p className="text-white/90 text-sm font-medium">Show on Profile</p>
                    <p className="text-white/40 text-xs">Visible on your Flow Circuit results</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-white/[0.08]" />

                <div className="flex items-center gap-3">
                  <Switch
                    checked={profile.showInTeam ?? false}
                    onCheckedChange={(checked) => {
                      if (profile.id) toggleTeamMutation.mutate({ id: profile.id, showInTeam: checked });
                    }}
                  />
                  <div>
                    <p className="text-white/90 text-sm font-medium">Show in Team View</p>
                    <p className="text-white/40 text-xs">Teammates can see your reading</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Synthesis Overview */}
        {synthesis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08] p-6">
              <div className="absolute -top-16 -left-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h3 className="text-white/90 font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Your Synthesis
                </h3>
                <p className="text-white/70 text-sm leading-relaxed italic">{synthesis}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cross-Reference Card */}
        {enneagramNum && (
          <div className="mb-8">
            <CrossReferenceCard enneagramNum={enneagramNum} flowRole={flowRole} />
          </div>
        )}

        {/* Topic Sections */}
        <div className="space-y-4 mb-12">
          {sections.map((section, i) => (
            <motion.div key={section.topic} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i + 3) }}>
              <Section section={section} />
            </motion.div>
          ))}
        </div>

        {/* Science & Evidence Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="w-full flex items-center gap-4 p-6 text-left"
            >
              <div className="p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-emerald-400">The Science Behind This</h3>
                <p className="text-white/50 text-sm">Fortune 500 case studies & research evidence</p>
              </div>
              <div className="text-white/40">
                {showEvidence ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </button>

            <AnimatePresence>
              {showEvidence && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-white/60 text-sm leading-relaxed">
                      Consciousness-based personality frameworks are no longer fringe. Over 80% of Fortune 500
                      companies use personality assessments, and a growing number integrate deeper self-awareness
                      practices — from the Enneagram to mindfulness programs — with measurable business results.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {evidenceData.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 text-emerald-400" />
                              <span className="text-white/90 text-sm font-semibold">{item.company}</span>
                            </div>
                            <p className="text-emerald-400 text-lg font-bold mb-1">{item.stat}</p>
                            <p className="text-white/50 text-xs">{item.detail}</p>
                            <p className="text-white/30 text-xs mt-1">{item.source}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
                      <h4 className="text-white/80 text-sm font-medium mb-2">Honest Limitations</h4>
                      <ul className="text-white/50 text-xs space-y-1.5">
                        <li>The Enneagram has growing but mixed psychometric validation (Hook et al., 2021 — 104 samples)</li>
                        <li>Astrology and numerology lack peer-reviewed empirical support for predictive accuracy</li>
                        <li>Human Design combines multiple systems; scientific validation is limited</li>
                        <li>These frameworks are best used as reflective tools, not diagnostic instruments</li>
                        <li>The value lies in self-awareness and team dialogue, not in categorical truth</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center pb-12"
        >
          <p className="text-white/30 text-xs">
            SoulPrint data provided by TrueSelf. This reading is separate from your Flow Circuit assessment
            and can be toggled on or off at any time.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
