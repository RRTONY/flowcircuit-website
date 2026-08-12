"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Brain, Compass, Star, Moon, Sun, Key, Baby, Briefcase,
  HeartHandshake, Heart, LayoutDashboard, CloudMoon, UserCircle,
  AlertTriangle, ChevronRight,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import demoData from "./demoData.json";

// ─── Topic config — warm, editorial palette (full literal Tailwind classes) ──
const TOPIC_CONFIG: Record<string, {
  icon: any; label: string; description: string;
  text: string; chip: string; bar: string; ring: string;
}> = {
  overview: { icon: LayoutDashboard, label: "Overview", description: "The synthesis of every system into one narrative", text: "text-amber-800", chip: "bg-amber-100 text-amber-800", bar: "bg-amber-600", ring: "ring-amber-300" },
  enneagram: { icon: Brain, label: "Enneagram", description: "Core personality architecture — drives, fears, growth", text: "text-rose-800", chip: "bg-rose-100 text-rose-800", bar: "bg-rose-600", ring: "ring-rose-300" },
  human_design: { icon: Compass, label: "Human Design", description: "Energetic blueprint — strategy, authority, type", text: "text-emerald-800", chip: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-600", ring: "ring-emerald-300" },
  western_astrology: { icon: Star, label: "Western Astrology", description: "Celestial map — planets, signs, houses", text: "text-violet-800", chip: "bg-violet-100 text-violet-800", bar: "bg-violet-600", ring: "ring-violet-300" },
  vedic_astrology: { icon: Sun, label: "Vedic Astrology", description: "Planetary life stages (Dashas), past and present", text: "text-red-800", chip: "bg-red-100 text-red-800", bar: "bg-red-600", ring: "ring-red-300" },
  chinese_astrology: { icon: Moon, label: "Chinese Astrology", description: "Elemental nature — animal sign and five elements", text: "text-orange-800", chip: "bg-orange-100 text-orange-800", bar: "bg-orange-600", ring: "ring-orange-300" },
  numerology: { icon: Sparkles, label: "Numerology", description: "Numerical signature — life path, expression, soul urge", text: "text-cyan-800", chip: "bg-cyan-100 text-cyan-800", bar: "bg-cyan-600", ring: "ring-cyan-300" },
  gene_keys: { icon: Key, label: "Gene Keys", description: "Life's work, evolution, radiance, and purpose", text: "text-teal-800", chip: "bg-teal-100 text-teal-800", bar: "bg-teal-600", ring: "ring-teal-300" },
  inner_world: { icon: CloudMoon, label: "Inner World", description: "Fears, desires, and how you cope under stress", text: "text-indigo-800", chip: "bg-indigo-100 text-indigo-800", bar: "bg-indigo-600", ring: "ring-indigo-300" },
  self_understanding: { icon: UserCircle, label: "Self Understanding", description: "How your systems combine into one self-narrative", text: "text-sky-800", chip: "bg-sky-100 text-sky-800", bar: "bg-sky-600", ring: "ring-sky-300" },
  relationship: { icon: HeartHandshake, label: "Relationships", description: "How you show up in emotional intimacy", text: "text-pink-800", chip: "bg-pink-100 text-pink-800", bar: "bg-pink-600", ring: "ring-pink-300" },
  parenting: { icon: Baby, label: "Parenting", description: "Your natural parenting style and growth edges", text: "text-green-800", chip: "bg-green-100 text-green-800", bar: "bg-green-600", ring: "ring-green-300" },
  career: { icon: Briefcase, label: "Career", description: "Where you lead, and where you get in your own way", text: "text-blue-800", chip: "bg-blue-100 text-blue-800", bar: "bg-blue-600", ring: "ring-blue-300" },
  system_interaction: { icon: Heart, label: "Soulprint Combinations", description: "Where all systems converge — cross-system patterns", text: "text-fuchsia-800", chip: "bg-fuchsia-100 text-fuchsia-800", bar: "bg-fuchsia-600", ring: "ring-fuchsia-300" },
};

// Curated reading order — overview first, then systems, then synthesis, then life areas
const TAB_ORDER = [
  "overview", "enneagram", "human_design", "western_astrology", "vedic_astrology",
  "chinese_astrology", "numerology", "gene_keys", "inner_world", "self_understanding",
  "relationship", "parenting", "career", "system_interaction",
];

function parseSections(data: any[]) {
  if (!Array.isArray(data)) return [];
  const byTopic = new Map(
    data
      .filter(s => s.topic && s.topic !== "dashboard" && s.topic !== "dashboard_clone")
      .map(s => [s.topic, {
        topic: s.topic as string,
        title: s.title || s.subtitle || s.topic,
        subtitle: s.subtitle as string | undefined,
        blocks: (s.blocks || []).sort((a: any, b: any) => (a.index ?? 0) - (b.index ?? 0)),
      }])
  );
  const ordered = TAB_ORDER.filter(t => byTopic.has(t)).map(t => byTopic.get(t)!);
  const leftover = [...byTopic.entries()].filter(([t]) => !TAB_ORDER.includes(t)).map(([, v]) => v);
  return [...ordered, ...leftover];
}

function getSynthesis(data: any[]): string {
  if (!Array.isArray(data)) return "";
  const d = data.find(s => s.topic === "dashboard_clone");
  return d?.blocks?.[0]?.text || "";
}

function getName(data: any[]): string {
  if (!Array.isArray(data)) return "Your";
  const d = data.find(s => s.topic === "dashboard_clone");
  const subtitle: string = d?.blocks?.[0]?.subtitle || "";
  const match = subtitle.match(/^(.*?)\s+YOUR SOULPRINT/i);
  return match?.[1]?.trim() || "Your";
}

function firstBlockField(data: any[], topic: string, field: "title" | "text"): string | null {
  const t = data.find(s => s.topic === topic);
  const val = t?.blocks?.[0]?.[field];
  return typeof val === "string" ? val : null;
}

function extractStat(data: any[], topic: string, pattern: RegExp): string | null {
  const t = data.find(s => s.topic === topic);
  for (const b of t?.blocks || []) {
    const hay = [b.title, ...(Array.isArray(b.text) ? b.text : [b.text])].filter(Boolean).join(" ");
    const m = hay.match(pattern);
    if (m) return m[1];
  }
  return null;
}

// Groups blocks so an untitled "continuation" block (e.g. the long Enneagram
// subtype write-ups that follow a short titled teaser) stays attached to the
// titled block right before it, instead of being torn out of order.
type BlockGroup = { id: string; title: string | null; texts: (string | string[])[] };

function groupBlocks(blocks: any[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  for (const b of blocks) {
    if (!(b.title || b.text)) continue;
    if (b.title) {
      groups.push({ id: b.id || `t-${groups.length}`, title: b.title, texts: b.text ? [b.text] : [] });
    } else if (b.text) {
      if (groups.length === 0) {
        groups.push({ id: "lead", title: null, texts: [b.text] });
      } else {
        groups[groups.length - 1].texts.push(b.text);
      }
    }
  }
  return groups;
}

function GroupText({ group }: { group: BlockGroup }) {
  const paras = group.texts.flat();
  if (paras.length === 0) return null;
  return (
    <div className="space-y-3">
      {paras.map((t, i) => (
        <p key={i} className="text-[15px] leading-[1.75] text-stone-700 whitespace-pre-line">{t}</p>
      ))}
    </div>
  );
}

export default function SoulprintDemoClient() {
  const soulprintData = demoData as any[];
  const sections = useMemo(() => parseSections(soulprintData), [soulprintData]);
  const synthesis = useMemo(() => getSynthesis(soulprintData), [soulprintData]);
  const name = useMemo(() => getName(soulprintData), [soulprintData]);

  const enneagramTitle = useMemo(() => firstBlockField(soulprintData, "enneagram", "title"), [soulprintData]);
  const humanDesignType = useMemo(
    () => extractStat(soulprintData, "human_design", /\b(Projector|Manifesting Generator|Generator|Manifestor|Reflector)\b/),
    [soulprintData]
  );
  const lifePath = useMemo(
    () => extractStat(soulprintData, "numerology", /Life Path Number (\d+)/i),
    [soulprintData]
  );
  const sunSign = useMemo(
    () => extractStat(soulprintData, "western_astrology", /Your Sun in (\w+)/i),
    [soulprintData]
  );
  const chineseSign = useMemo(() => {
    const t = firstBlockField(soulprintData, "chinese_astrology", "title");
    return t ? t.replace(/\s*with Dominant.*/i, "") : null;
  }, [soulprintData]);

  const [active, setActive] = useState<string>(sections[0]?.topic || "overview");
  const activeSection = sections.find(s => s.topic === active) || sections[0];
  const cfg = TOPIC_CONFIG[activeSection?.topic] || {
    icon: Sparkles, label: activeSection?.topic, description: "", text: "text-stone-800", chip: "bg-stone-100 text-stone-800", bar: "bg-stone-600", ring: "ring-stone-300",
  };
  const Icon = cfg.icon;

  const stats = [
    enneagramTitle && { label: "Enneagram", value: enneagramTitle },
    humanDesignType && { label: "Human Design", value: humanDesignType },
    lifePath && { label: "Life Path", value: lifePath },
    sunSign && { label: "Sun Sign", value: sunSign },
    chineseSign && { label: "Chinese Zodiac", value: chineseSign },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#241f1a] pt-16">
      {/* Internal demo banner */}
      <div className="border-b border-amber-900/10 bg-amber-100/60">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <p className="text-amber-900/80 text-xs leading-relaxed">
            Internal demo — static sample Soulprint report for review. Not wired into the live assessment flow.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-14 pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-500 mb-3">Soulprint Dossier</p>
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-stone-900 mb-6">
          {name}&rsquo;s Soulprint
        </h1>

        {synthesis && (
          <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mb-8 italic">
            &ldquo;{synthesis.split(". ").slice(0, 2).join(". ")}.&rdquo;
          </p>
        )}

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl bg-white border border-stone-200 px-4 py-2.5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{s.label}</p>
                <p className="text-sm font-semibold text-stone-800 mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body: sidebar tabs + content */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar — desktop vertical tabs, mobile horizontal scroll */}
          <nav className="lg:sticky lg:top-8 lg:self-start">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
              {sections.map((s) => {
                const c = TOPIC_CONFIG[s.topic] || TOPIC_CONFIG.overview;
                const TIcon = c.icon;
                const isActive = s.topic === active;
                return (
                  <button
                    key={s.topic}
                    onClick={() => setActive(s.topic)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all shrink-0 lg:shrink border ${
                      isActive
                        ? `${c.chip} border-transparent shadow-sm ring-2 ${c.ring}`
                        : "bg-transparent border-transparent hover:bg-white/70"
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg ${isActive ? "bg-white/60" : c.chip}`}>
                      <TIcon className="w-4 h-4" />
                    </span>
                    <span className={`text-sm whitespace-nowrap ${isActive ? `font-bold ${c.text}` : "font-medium text-stone-600"}`}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.article
                key={activeSection.topic}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className={`h-2 ${cfg.bar} rounded-t-2xl`} />
                <div className="p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <span className={`p-3 rounded-xl ${cfg.chip}`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-stone-900">{cfg.label}</h2>
                      <p className="text-stone-500 text-sm mt-0.5">{cfg.description}</p>
                    </div>
                  </div>

                  {(() => {
                    const groups = groupBlocks(activeSection.blocks);
                    const lead = groups.find(g => g.title === null);
                    const named = groups.filter(g => g.title !== null);
                    return (
                      <>
                        {lead && (
                          <div className="mb-8">
                            <GroupText group={lead} />
                          </div>
                        )}

                        {named.length > 0 && (
                          <Accordion type="multiple" className="w-full">
                            {named.map((group, i) => (
                              <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.4) }}
                              >
                                <AccordionItem value={group.id}>
                                  <AccordionTrigger className="font-display text-base font-semibold text-stone-900 hover:no-underline">
                                    <span className="flex items-center gap-2.5">
                                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.bar}`} />
                                      {group.title}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <GroupText group={group} />
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </Accordion>
                        )}
                      </>
                    );
                  })()}

                  {sections.length > 1 && (
                    <button
                      onClick={() => {
                        const idx = sections.findIndex(s => s.topic === activeSection.topic);
                        const next = sections[(idx + 1) % sections.length];
                        setActive(next.topic);
                      }}
                      className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      Next: {(TOPIC_CONFIG[sections[(sections.findIndex(s => s.topic === activeSection.topic) + 1) % sections.length].topic] || {}).label}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <p className="text-center text-xs text-stone-400">
          Soulprint data provided by TrueSelf. This is a static demo render for internal review only.
        </p>
      </div>
    </div>
  );
}
