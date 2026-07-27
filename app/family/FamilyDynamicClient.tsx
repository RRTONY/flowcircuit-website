"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Activity, Shield, Anchor, Radio, Play, RefreshCw,
  Users, ArrowRight, AlertTriangle, CheckCircle2, Copy, Heart,
  Home as HomeIcon, Download, Loader2,
} from "lucide-react";
import {
  Role, calculateRoleScores, getCombinationProfile, getStressZones,
  getRolePercentages, analyzeTeamStress, TeamMemberProfile,
} from "@/lib/surveyData";

const roleConfig: Record<string, { color: string; bgClass: string; textClass: string; icon: any; label: string; familyDescription: string }> = {
  Spark: { color: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-600", icon: Zap, label: "Spark", familyDescription: "The Dreamer — always imagining what the family could become" },
  Amplifier: { color: "#ef4444", bgClass: "bg-red-500", textClass: "text-red-600", icon: Activity, label: "Amplifier", familyDescription: "The Cheerleader — rallies everyone and keeps spirits high" },
  Filter: { color: "#8b5cf6", bgClass: "bg-violet-500", textClass: "text-violet-600", icon: Shield, label: "Filter", familyDescription: "The Protector — sees risks, asks the hard questions" },
  Ground: { color: "#2563eb", bgClass: "bg-blue-600", textClass: "text-blue-600", icon: Anchor, label: "Ground", familyDescription: "The Rock — makes sure bills get paid and plans happen" },
  Conductor: { color: "#10b981", bgClass: "bg-emerald-500", textClass: "text-emerald-600", icon: Radio, label: "Conductor", familyDescription: "The Peacemaker — keeps everyone connected and in sync" },
};

const roleZones: Record<string, { cx: number; cy: number }> = {
  Spark: { cx: 35, cy: 18 },
  Amplifier: { cx: 72, cy: 22 },
  Filter: { cx: 25, cy: 72 },
  Ground: { cx: 70, cy: 78 },
  Conductor: { cx: 50, cy: 48 },
};

function generatePositions(index: number, role: string) {
  const chaosX = ((index * 37 + 13) % 70) + 10;
  const chaosY = ((index * 53 + 7) % 65) + 12;
  const zone = roleZones[role] || roleZones.Conductor;
  const spread = 10;
  const offsetX = ((index * 17) % (spread * 2)) - spread;
  const offsetY = ((index * 23) % (spread * 2)) - spread;
  const flowX = Math.max(8, Math.min(92, zone.cx + offsetX));
  const flowY = Math.max(8, Math.min(92, zone.cy + offsetY));
  return { chaos: { x: chaosX, y: chaosY }, flow: { x: flowX, y: flowY } };
}

// Family-specific insights based on role combinations
function getFamilyInsight(roleDistribution: Record<string, number>, total: number): string[] {
  const insights: string[] = [];

  if (!roleDistribution.Conductor || roleDistribution.Conductor === 0) {
    insights.push("No natural Conductor in the family. This means scheduling, logistics, and keeping everyone connected falls on someone who isn't wired for it — and that creates silent resentment. Consider designating a family 'sync' ritual (weekly dinner, group chat check-in) to compensate.");
  }

  if (roleDistribution.Spark && roleDistribution.Ground && !roleDistribution.Amplifier) {
    insights.push("You have a Dreamer and a Doer but no one bridging the gap. The Spark proposes vacations, projects, changes — and the Ground immediately thinks about logistics and cost. Without an Amplifier to build excitement, great family ideas die in the gap between vision and execution.");
  }

  if ((roleDistribution.Spark || 0) >= 2) {
    insights.push("Multiple Sparks in the family means constant new ideas competing for attention. This can feel chaotic — especially for Grounds and Filters who need stability. The key: take turns. One Spark's idea gets the spotlight this month.");
  }

  if ((roleDistribution.Filter || 0) >= 2) {
    insights.push("Multiple Filters means everyone's ideas get scrutinized twice. This can feel like nothing is ever good enough. Remember: Filters protect through critique, but too much critique at home kills joy. Create 'no-critique zones' — spaces where ideas are just celebrated.");
  }

  if (!roleDistribution.Spark || roleDistribution.Spark === 0) {
    insights.push("No natural Spark in the family. Without someone pushing for change, growth, and new experiences, the family can fall into comfortable routines that slowly calcify. Schedule regular 'what if' conversations to keep the energy fresh.");
  }

  if (roleDistribution.Spark && roleDistribution.Filter) {
    insights.push("Your Spark and Filter are the family's creative tension. The Spark dreams, the Filter reality-checks. This is healthy — but only if both feel heard. The Spark needs space to dream without immediate critique. The Filter needs their concerns taken seriously, not dismissed as 'negativity.'");
  }

  return insights;
}

function getFamilyStressInsight(gaps: Role[]): string {
  if (gaps.length === 0) return "Your family has balanced energy across all roles. This is rare and beautiful — it means no one is being forced to operate against their nature at home.";

  const gapNames = gaps.join(" and ");
  return `Your family is missing natural ${gapNames} energy. This means someone in the family is being forced into that role — and home is supposed to be where you can be yourself. When a Spark is forced to be the Ground at home (paying bills, managing logistics), or a Ground is forced to be the Spark (generating excitement for family activities they didn't choose), it creates a specific kind of exhaustion that's different from work stress. It's the stress of not being seen for who you actually are by the people who matter most.`;
}

function DownloadFamilyReportButton({ domain, familyName }: { domain: string; familyName: string }) {
  const generateReport = trpc.report.generateFamilyFriction.useMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await generateReport.mutateAsync({ domain, familyName: `The ${familyName} Family` });
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (err: any) {
      console.error('Failed to generate family report:', err);
      alert(err?.message || 'Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      className="bg-rose-500 text-white hover:bg-rose-600 font-bold"
    >
      {downloading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
      ) : (
        <><Download className="mr-2 h-4 w-4" /> Family Report PDF</>
      )}
    </Button>
  );
}

export default function FamilyDynamic() {
  const [isFixed, setIsFixed] = useState(false);
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [showSetup, setShowSetup] = useState(false);

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const domain = searchParams.get("family") || searchParams.get("domain");

  const { data: domainResults, isLoading } = trpc.assessment.byDomain.useQuery(
    { domain: domain! },
    { enabled: !!domain }
  );

  const results = domainResults || [];

  const familyMembers = useMemo(() => {
    return results.map((assessment: any, index: number) => {
      const role = assessment.role || "Conductor";
      const config = roleConfig[role] || roleConfig.Conductor;
      const positions = generatePositions(index, role);

      let scores: Record<Role, number> | null = null;
      let profile = null;
      let purityScore = 0;
      let comboLabel = role;

      if (assessment.answers) {
        try {
          const parsedAnswers = typeof assessment.answers === 'string' ? JSON.parse(assessment.answers) : assessment.answers;
          scores = calculateRoleScores(parsedAnswers);
          profile = getCombinationProfile(scores);
          purityScore = profile.purityScore;
          comboLabel = profile.label;
        } catch { /* fallback */ }
      }

      return {
        id: assessment.id,
        name: assessment.guestName || `Family Member ${index + 1}`,
        role,
        ...positions,
        color: config.bgClass,
        colorHex: config.color,
        icon: config.icon,
        scores,
        profile,
        purityScore,
        comboLabel,
      };
    });
  }, [results]);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    familyMembers.forEach((m: any) => {
      counts[m.role] = (counts[m.role] || 0) + 1;
    });
    return counts;
  }, [familyMembers]);

  // Family stress analysis
  const familyStressAnalysis = useMemo(() => {
    const membersWithProfiles: TeamMemberProfile[] = familyMembers
      .filter((m: any) => m.scores && m.profile)
      .map((m: any) => ({
        name: m.name,
        scores: m.scores!,
        profile: m.profile!,
        stressZones: getStressZones(m.profile!),
      }));

    if (membersWithProfiles.length < 2) return null;
    return analyzeTeamStress(membersWithProfiles);
  }, [familyMembers]);

  const familyInsights = useMemo(() => {
    if (familyMembers.length < 2) return [];
    return getFamilyInsight(roleDistribution, familyMembers.length);
  }, [familyMembers, roleDistribution]);

  const handleCopyInviteLink = () => {
    const url = `${window.location.origin}/assessment?domain=${encodeURIComponent(domain || "")}&context=family`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- No family entered ---
  if (!domain) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Family Dynamic</h1>
          <p className="text-gray-500 text-lg leading-relaxed" style={{ textWrap: 'balance' as any }}>
            The same Flow Circuit that powers teams also runs through families. Someone's the Spark, someone's the Ground — and the friction of being forced into the wrong role at home is just as real as at work. Maybe more.
          </p>
          <p className="text-gray-400 text-sm">
            Create a family code and have each family member take the assessment.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as any).familyCode.value;
              if (input) router.push(`/family?family=${encodeURIComponent(input.trim().toLowerCase().replace(/\s+/g, '-'))}`);
            }}
            className="flex gap-3"
          >
            <input
              name="familyCode"
              type="text"
              placeholder="e.g., the-greenbergs"
              className="flex-1 h-12 px-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
            />
            <Button type="submit" className="bg-rose-500 text-white hover:bg-rose-600 font-bold h-12 px-6">
              View Family <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="text-sm text-gray-400">
            Or <Link href="/assessment" className="text-rose-500 underline">take the assessment first</Link> — use your family code as the domain.
          </p>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Loading family map...</p>
      </div>
    );
  }

  // --- No members ---
  if (familyMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <Heart className="w-16 h-16 text-rose-300 mx-auto" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">No Family Members Yet</h1>
          <p className="text-gray-500 text-lg">
            No one has taken the assessment with the code <strong className="text-gray-900">{domain}</strong> yet.
            Be the first to map your family's energy.
          </p>
          <Link href={`/assessment?domain=${encodeURIComponent(domain)}&context=family`}>
            <Button className="bg-rose-500 text-white hover:bg-rose-600 font-bold px-8 py-6 text-xl">
              Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Family View ---
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-400">Family Energy Map</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              {domain.replace(/-/g, ' ')}
            </h1>
            <p className="text-gray-500 mt-1">
              {familyMembers.length} family member{familyMembers.length !== 1 ? "s" : ""} mapped
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyInviteLink}
              variant="outline"
              className="border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50"
            >
              {copiedLink ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Copied!</> : <><Copy className="mr-2 h-4 w-4" /> Copy Family Link</>}
            </Button>
            {familyMembers.length >= 2 && (
              <DownloadFamilyReportButton domain={domain} familyName={domain.replace(/-/g, ' ')} />
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(roleConfig).map(([role, config]) => {
            const count = roleDistribution[role] || 0;
            const Icon = config.icon;
            return (
              <div
                key={role}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  count > 0 ? "bg-white shadow-sm border-gray-200" : "bg-gray-50 border-gray-100 opacity-40"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm">{role}</span>
                <span className="text-gray-400 text-xs">{config.familyDescription}</span>
                <span className="text-gray-400 text-sm font-bold">{count}</span>
              </div>
            );
          })}
        </div>

        {/* The Family Map */}
        <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: "5/4", maxHeight: "480px" }}>
          <div className="absolute inset-0 bg-rose-50/50 rounded-2xl border-2 border-rose-200 overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(#e11d48 1px, transparent 1px), linear-gradient(90deg, #e11d48 1px, transparent 1px)",
                backgroundSize: "50px 50px",
              }}
            />

            {/* Axis labels */}
            <div className="absolute inset-0 pointer-events-none z-[5]">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Vision</span>
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                <Anchor className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Stability</span>
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 flex items-center gap-1.5 origin-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Reflection</span>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 flex items-center gap-1.5 origin-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Action</span>
              </div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-rose-200" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-rose-200" />
            </div>

            {/* Zone labels in flow mode */}
            <AnimatePresence>
              {isFixed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none z-[4]"
                >
                  {Object.entries(roleZones).map(([role, pos]) => {
                    const config = roleConfig[role];
                    return (
                      <div
                        key={role}
                        className="absolute text-center"
                        style={{ left: `${pos.cx}%`, top: `${pos.cy}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <div className={`text-[9px] font-bold uppercase tracking-wider ${config.textClass} opacity-40`}>
                          {config.familyDescription.split('—')[0].trim()}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Family Nodes */}
            {familyMembers.map((member: any) => {
              const initials = member.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
              const ringSize = member.purityScore > 60 ? 48 : member.purityScore > 30 ? 42 : 36;
              const ringOpacity = member.purityScore > 60 ? 0.3 : member.purityScore > 30 ? 0.2 : 0.1;

              return (
                <motion.div
                  key={member.id}
                  className="absolute z-10 flex flex-col items-center group"
                  style={{ transform: "translate(-50%, -50%)" }}
                  initial={false}
                  animate={{
                    left: isFixed ? `${member.flow.x}%` : `${member.chaos.x}%`,
                    top: isFixed ? `${member.flow.y}%` : `${member.chaos.y}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 40,
                    damping: 15,
                    mass: 1.2,
                    delay: isFixed ? (member.id % 20) * 0.05 : 0,
                  }}
                  whileHover={{ scale: 1.15, zIndex: 50 }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: ringSize, height: ringSize,
                      backgroundColor: member.colorHex, opacity: ringOpacity,
                      top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '-6px',
                    }}
                  />
                  <div
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white cursor-pointer relative z-10"
                    style={{ backgroundColor: member.colorHex }}
                  >
                    <span className="text-[10px] font-black">{initials}</span>
                  </div>
                  <div className="mt-0.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-700 whitespace-nowrap shadow-sm max-w-[70px] truncate relative z-10">
                    {member.name.split(" ")[0]}
                  </div>
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-xl z-50 space-y-0.5">
                    <div>{member.name}</div>
                    <div className="text-gray-300">{member.comboLabel} — {roleConfig[member.role]?.familyDescription.split('—')[1]?.trim() || member.role}</div>
                  </div>
                </motion.div>
              );
            })}

            {/* Control Button */}
            <div className="absolute bottom-3 right-3 z-20">
              <Button
                size="sm"
                onClick={() => setIsFixed(!isFixed)}
                className={`shadow-xl transition-all duration-300 h-10 px-5 rounded-full text-xs font-bold ${
                  isFixed
                    ? "bg-gray-800 text-white hover:bg-black"
                    : "bg-rose-500 text-white hover:bg-rose-600 animate-pulse"
                }`}
              >
                {isFixed ? (
                  <><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Reset</>
                ) : (
                  <><Play className="mr-1.5 h-3.5 w-3.5 fill-current" /> See Family Flow</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Map Legend */}
        <div className="max-w-3xl mx-auto bg-rose-50 rounded-xl p-4 border border-rose-200">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400 mb-2">How to Read This Map</h3>
          <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-600">
            <div><p><strong className="text-gray-900">Vertical:</strong> Vision (top) vs. Stability (bottom).</p></div>
            <div><p><strong className="text-gray-900">Horizontal:</strong> Reflection (left) vs. Action (right).</p></div>
            <div><p><strong className="text-gray-900">Ring size:</strong> Larger glow = more concentrated in their role.</p></div>
          </div>
        </div>

        {/* ═══ FAMILY INSIGHTS ═══ */}
        {familyInsights.length > 0 && (
          <div className="space-y-6">
            <div className="border-t-2 border-rose-300 pt-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Family Dynamic Report</h2>
              <p className="text-gray-500 text-sm">How your family's energy flows — and where it gets stuck.</p>
            </div>

            <div className="space-y-4">
              {familyInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 md:p-6 rounded-2xl bg-rose-50 border-2 border-rose-200"
                >
                  <p className="text-gray-700 leading-relaxed" style={{ textWrap: 'pretty' as any }}>{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ FAMILY STRESS ANALYSIS ═══ */}
        {familyStressAnalysis && (
          <div className="space-y-6">
            <div className="border-t-2 border-gray-900 pt-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">Where the Stress Lives</h2>
              <p className="text-gray-500 text-sm">Home is supposed to be where you can be yourself. Here's where that breaks down.</p>
            </div>

            {/* Friction Pairs */}
            {familyStressAnalysis.frictionPairs.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-orange-700">
                  <AlertTriangle className="w-4 h-4" /> Natural Tension Points
                </h3>
                <p className="text-xs text-gray-500">These aren't personality clashes — they're different operating systems trying to share the same house.</p>
                <div className="space-y-3">
                  {familyStressAnalysis.frictionPairs.map((pair, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{pair.member1} ↔ {pair.member2}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{pair.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Energy gaps */}
            {familyStressAnalysis.gaps.length > 0 && (
              <div className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200 rounded-2xl p-6 space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-700">
                  <Heart className="w-4 h-4" /> The Hidden Cost
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm" style={{ textWrap: 'pretty' as any }}>
                  {getFamilyStressInsight(familyStressAnalysis.gaps)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ═══ FAMILY ROSTER ═══ */}
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tight mb-4">Family Members</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {familyMembers.map((member: any) => {
              const config = roleConfig[member.role];
              const Icon = config?.icon || Users;
              return (
                <div key={member.id} className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white">
                  <div className="relative flex-shrink-0">
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: member.purityScore > 50 ? 44 : 38,
                        height: member.purityScore > 50 ? 44 : 38,
                        backgroundColor: config?.color || "#999",
                        opacity: member.purityScore > 50 ? 0.2 : 0.1,
                        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      }}
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white relative z-10"
                      style={{ backgroundColor: config?.color || "#999" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.comboLabel}</p>
                    <p className="text-xs text-gray-400">{config?.familyDescription}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ FAMILY 360 REVIEW ═══ */}
        <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">Family 360 Review</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Want to see how your family <em>really</em> sees each other? The Family 360 lets each member
            rank how they perceive the others — using family language (Dreamer, Cheerleader, Protector, Rock, Peacemaker).
            Compare self-perception vs. family perception.
          </p>
          <p className="text-xs text-gray-400">
            Each family member can generate their own 360 link from their results page.
            Share the <code className="bg-rose-50 px-1 rounded">/family-360/TOKEN</code> link with other family members.
          </p>
        </div>

        {/* ═══ INVITE CTA ═══ */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white rounded-2xl p-8 md:p-12 space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              {familyMembers.length < 3
                ? "Your family map needs everyone."
                : "Invite the rest of the family."}
            </h2>
            <p className="text-rose-100 text-lg max-w-2xl mx-auto">
              The more family members who take the assessment, the clearer the dynamic becomes.
              Share this link — it takes 3 minutes.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={`${window.location.origin}/assessment?domain=${encodeURIComponent(domain)}&context=family`}
                className="bg-black/30 text-white text-sm flex-1 outline-none rounded-lg px-3 py-2 border border-white/10 truncate"
              />
              <Button
                onClick={handleCopyInviteLink}
                className="bg-white text-rose-600 hover:bg-rose-50 font-bold px-6 shrink-0"
              >
                {copiedLink ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href={`/assessment?domain=${encodeURIComponent(domain)}&context=family`}>
              <Button className="bg-white text-rose-600 hover:bg-rose-50 font-bold px-8 py-6 text-lg w-full sm:w-auto">
                Take the Assessment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
