"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import {
  calculateRoleScores, getDominantRole, getRolePercentages,
  roleDescriptions, Role, getCombinationProfile, getStressZones,
  getBestSelfInsight, CombinationProfile, StressZone, roleInsights, getActionSteps
} from "@/lib/surveyData";
import { ArrowRight, Download, Users, Zap, Activity, Shield, Anchor, Radio, Share2, ChevronRight, Copy, CheckCircle2, AlertTriangle, Heart, Flame, Snowflake, Compass, Gem, TrendingUp, BookOpen, Sparkles, ExternalLink, Eye, Loader2 } from "lucide-react";
import ShareableCard from "@/components/ShareableCard";
import { trpc } from "@/lib/trpc";
import { getLatestAssessment } from "@/lib/assessmentPersistence";
import { useAuth } from "@/hooks/useAuth";
import OnboardingWizard from "@/components/OnboardingWizard";
import BlogBridge from "@/components/BlogBridge";
import ResearchOptIn from "@/components/ResearchOptIn";
import ThreeSixtyLinkGenerator from "@/components/ThreeSixtyLinkGenerator";
import { useRouter } from "next/navigation";

const roleIcons: Record<Role, any> = {
  Spark: Zap,
  Amplifier: Activity,
  Filter: Shield,
  Ground: Anchor,
  Conductor: Radio,
};

const roleColors: Record<Role, { bg: string; text: string; accent: string; border: string; light: string }> = {
  Spark: { bg: "bg-amber-500", text: "text-amber-500", accent: "#f59e0b", border: "border-amber-500", light: "bg-amber-50" },
  Amplifier: { bg: "bg-red-500", text: "text-red-500", accent: "#ef4444", border: "border-red-500", light: "bg-red-50" },
  Filter: { bg: "bg-violet-500", text: "text-violet-500", accent: "#8b5cf6", border: "border-violet-500", light: "bg-violet-50" },
  Ground: { bg: "bg-blue-600", text: "text-blue-600", accent: "#2563eb", border: "border-blue-600", light: "bg-blue-50" },
  Conductor: { bg: "bg-emerald-500", text: "text-emerald-500", accent: "#10b981", border: "border-emerald-500", light: "bg-emerald-50" },
};

function StressGauge({ level, label }: { level: number; label: string }) {
  const getColor = () => {
    if (level <= 10) return "bg-emerald-500";
    if (level <= 30) return "bg-green-400";
    if (level <= 55) return "bg-yellow-400";
    if (level <= 75) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold uppercase tracking-wider text-gray-500">{label}</span>
        <span className="font-mono font-bold text-gray-700">{level}%</span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${getColor()} rounded-full`}
        />
      </div>
    </div>
  );
}

export default function AlignmentResults() {
  const [selfData, setSelfData] = useState<any>(null);
  const [guestName, setGuestName] = useState("");
  const router = useRouter();
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showWizard, setShowWizard] = useState(true);
  const [loadingFromServer, setLoadingFromServer] = useState(false);
  const { user } = useAuth();

  // Determine email for server fallback lookup
  const storedEmail = useMemo(() => {
    // Check localStorage for email
    const localEmail = localStorage.getItem("assessment_guest_email") || localStorage.getItem("fc_last_email");
    if (localEmail) return localEmail;
    // Check persisted history
    const latest = getLatestAssessment();
    if (latest?.email) return latest.email;
    // Check auth user
    if (user?.email) return user.email;
    return null;
  }, [user]);

  // Server fallback: fetch assessment by email if localStorage is empty
  const { data: serverAssessment } = trpc.assessment.getByEmail.useQuery(
    { email: storedEmail! },
    { enabled: !!storedEmail && !selfData && !loadingFromServer }
  );

  useEffect(() => {
    // Step 1: Try localStorage first (fastest)
    const storedSelf = localStorage.getItem("assessment_results");
    const storedName = localStorage.getItem("assessment_guest_name") || localStorage.getItem("assessment_name");

    if (storedSelf) {
      const answers = JSON.parse(storedSelf);
      const scores = calculateRoleScores(answers);
      const dominant = getDominantRole(scores);
      setSelfData({ answers, scores, dominant });
      if (storedName) setGuestName(storedName);
      return;
    }

    // Step 2: Try persisted assessment history (cross-session localStorage)
    const persisted = getLatestAssessment();
    if (persisted?.scores) {
      const scores = persisted.scores as Record<string, number>;
      const dominant = getDominantRole(scores);
      setSelfData({ answers: null, scores, dominant });
      setGuestName(persisted.name || "");
      // Restore localStorage so the page works fully
      localStorage.setItem("assessment_dominant_role", persisted.role);
      localStorage.setItem("assessment_role_scores", JSON.stringify(scores));
      localStorage.setItem("assessment_name", persisted.name);
      if (persisted.assessmentId) localStorage.setItem("assessment_id", String(persisted.assessmentId));
      if (persisted.domain) localStorage.setItem("assessment_domain", persisted.domain);
      if (persisted.shareToken) localStorage.setItem("assessment_share_token", persisted.shareToken);
      if (persisted.teamCode) localStorage.setItem("assessment_team_code", persisted.teamCode);
      if (persisted.teamId) localStorage.setItem("assessment_team_id", persisted.teamId);
      return;
    }

    // Step 3: Will try server (handled by the trpc query above)
    if (storedEmail) {
      setLoadingFromServer(true);
    }

    if (storedName) setGuestName(storedName);
  }, []);

  // Handle server response
  useEffect(() => {
    if (serverAssessment && !selfData) {
      const scores = (serverAssessment.scores as Record<string, number>) || {};
      if (Object.keys(scores).length > 0) {
        const dominant = getDominantRole(scores);
        setSelfData({ answers: serverAssessment.answers, scores, dominant });
        setGuestName(serverAssessment.guestName || "");
        // Restore localStorage for future visits
        if (serverAssessment.answers) localStorage.setItem("assessment_results", JSON.stringify(serverAssessment.answers));
        localStorage.setItem("assessment_dominant_role", serverAssessment.role || dominant.role);
        localStorage.setItem("assessment_role_scores", JSON.stringify(scores));
        localStorage.setItem("assessment_name", serverAssessment.guestName || "");
        localStorage.setItem("assessment_guest_name", serverAssessment.guestName || "");
        localStorage.setItem("assessment_id", String(serverAssessment.id));
        if (serverAssessment.domain) localStorage.setItem("assessment_domain", serverAssessment.domain);
        if (serverAssessment.shareToken) localStorage.setItem("assessment_share_token", serverAssessment.shareToken);
        if (serverAssessment.guestEmail) localStorage.setItem("assessment_guest_email", serverAssessment.guestEmail);
      }
      setLoadingFromServer(false);
    }
  }, [serverAssessment, selfData]);

  const rolePercentages = useMemo(() => {
    if (!selfData) return [];
    return getRolePercentages(selfData.scores);
  }, [selfData]);

  const comboProfile = useMemo(() => {
    if (!selfData) return null;
    return getCombinationProfile(selfData.scores);
  }, [selfData]);

  const stressZones = useMemo(() => {
    if (!comboProfile || !selfData) return [];
    return getStressZones(comboProfile, selfData.scores);
  }, [comboProfile, selfData]);

  const actionSteps = useMemo(() => {
    if (!selfData) return [];
    return getActionSteps(selfData.dominant.role as Role);
  }, [selfData]);

  const bestSelfInsight = useMemo(() => {
    if (!comboProfile || stressZones.length === 0) return "";
    return getBestSelfInsight(comboProfile, stressZones);
  }, [comboProfile, stressZones]);

  const radarData = useMemo(() => {
    if (!selfData) return [];
    const maxPossible = 120;
    return [
      { subject: "Spark", value: selfData.scores.Spark, fullMark: maxPossible },
      { subject: "Amplifier", value: selfData.scores.Amplifier, fullMark: maxPossible },
      { subject: "Filter", value: selfData.scores.Filter, fullMark: maxPossible },
      { subject: "Ground", value: selfData.scores.Ground, fullMark: maxPossible },
      { subject: "Conductor", value: selfData.scores.Conductor, fullMark: maxPossible },
    ];
  }, [selfData]);

  if (!selfData) {
    // Show loading state while fetching from server
    if (loadingFromServer || (storedEmail && !serverAssessment)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600 text-lg">Loading your results...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <h1 className="text-3xl font-black mb-4 tracking-tight">No Assessment Data</h1>
          <p className="text-gray-600 mb-6 text-lg" style={{ textWrap: 'balance' as any }}>
            Complete the 12-question assessment to unlock your Flow Circuit report.
          </p>
          <Button
            onClick={() => router.push("/assessment")}
            className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg font-bold uppercase"
          >
            Take the Assessment
          </Button>
        </div>
      </div>
    );
  }

  const dominant = selfData.dominant.role as Role;
  const colors = roleColors[dominant];
  const insights = roleInsights[dominant];
  const description = roleDescriptions[dominant];
  const Icon = roleIcons[dominant];
  const domain = localStorage.getItem("assessment_domain") || "";
  const assessmentId = localStorage.getItem("assessment_id") || "";

  const handleCopyInvite = () => {
    const url = domain
      ? `${window.location.origin}/assessment?domain=${encodeURIComponent(domain)}`
      : `${window.location.origin}/assessment`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ── Onboarding Wizard ── */}
      {showWizard && (
        <OnboardingWizard
          role={dominant}
          score={Math.round(rolePercentages[0]?.percentage || 0)}
          teamCode={localStorage.getItem("assessment_team_code") || undefined}
          onClose={() => setShowWizard(false)}
        />
      )}

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 ${colors.bg} opacity-5`} />
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-12 pb-12 md:pt-20 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
              <span>Flow Circuit Report</span>
            </div>

            {/* NAME — Prominent */}
            {guestName && (
              <h2 className="text-2xl md:text-4xl font-black tracking-tight text-gray-800">
                {guestName}
              </h2>
            )}

            <div className="flex items-start gap-6">
              <div className={`${colors.bg} text-white p-4 md:p-5 rounded-2xl flex-shrink-0`}>
                <Icon className="w-10 h-10 md:w-14 md:h-14" />
              </div>
              <div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-3">
                  {comboProfile ? comboProfile.label : description.title}
                </h1>
                <p className="text-lg md:text-2xl text-gray-600 max-w-2xl leading-relaxed" style={{ textWrap: 'balance' as any }}>
                  {insights.tagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 items-center">
              <span className={`${colors.light} ${colors.text} px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider`}>
                {dominant} — {rolePercentages[0]?.percentage}%
              </span>
              {rolePercentages.length > 1 && !comboProfile?.isPure && (
                <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                  + {rolePercentages[1]?.role} ({rolePercentages[1]?.percentage}%)
                </span>
              )}
              {comboProfile && (
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${comboProfile.purityScore > 50 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {comboProfile.purityScore > 70 ? 'Highly Concentrated' : comboProfile.purityScore > 40 ? 'Moderately Focused' : 'Versatile Blend'}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20 space-y-12 md:space-y-16">

        {/* ── How to Read This Report — newcomer orientation ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
        >
          <div className="p-5 md:p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">How to Read This Report</p>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
              Your <strong>role</strong> ({dominant}) is where your energy naturally goes. <strong>Purity Score</strong> shows how concentrated that energy is in one role versus spread across several. <strong>Stress Radiation Map</strong> is an estimate of how much friction you'd likely feel doing each of the other roles. Start with your 3 action steps below — the deep-dive sections further down are optional reading.
            </p>
          </div>
        </motion.section>

        {/* ── YOUR 3 ACTION STEPS — the useful stuff, up front ── */}
        {actionSteps.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
          >
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
              Your 3 Action Steps
            </h2>
            <p className="text-gray-500 mb-6">
              The short version. Everything below is context — this is what to actually do with it.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {actionSteps.map((step, idx) => (
                <div key={step.title} className={`p-6 rounded-2xl border-2 ${colors.border} ${colors.light}`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${colors.bg} text-white text-sm font-black mb-3`}>
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-base uppercase tracking-wide mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── THE CORE THESIS: Who You ARE > What You KNOW ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-400" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">The Science</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                It's more important <span className="text-amber-400">who you are</span> than what you know.
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-3xl" style={{ textWrap: 'pretty' as any }}>
                Meredith Belbin's team-role research at Henley Management College found that teams stacked with the "smartest" individuals consistently underperformed teams with balanced role diversity — a result now widely known as the Apollo Syndrome (
                <a href="https://www.belbin.com/resources/articles-directory/belbin-apollo-teams" target="_blank" rel="noopener noreferrer" className="underline text-amber-300 hover:text-amber-200">source</a>
                ). The neuroscience is clear: when you operate in your natural mode, you enter flow state; when you're forced out of it, cortisol spikes, cognitive load increases, and performance degrades. Your Flow Circuit role isn't a skill you learned — it's the operating system you were born with.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Combination Profile ── */}
        {comboProfile && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
              Your Profile: {comboProfile.label}
            </h2>
            <p className="text-gray-500 mb-6">
              <strong>Purity Score</strong> (0–100): how concentrated your energy is in one role vs. spread across several — not a measure of skill. {comboProfile.purityScore}/100 — {comboProfile.purityScore > 70 ? "your energy is laser-focused" : comboProfile.purityScore > 40 ? "you have a clear primary with secondary range" : "you're a versatile operator with distributed energy"}
            </p>
            <div className={`p-6 md:p-8 rounded-2xl ${colors.light} border-2 ${colors.border}`}>
              <p className="text-lg md:text-xl leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {comboProfile.description}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── Energy Distribution with Percentages ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
            Your Energy Distribution
          </h2>
          <p className="text-gray-500 mb-6">
            How your energy is distributed across the five Flow Circuit roles. Percentages show relative strength — they add up to 100%.
          </p>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Radar Chart */}
            <Card className="border-2 border-gray-100 shadow-none">
              <CardContent className="h-[320px] md:h-[380px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#111', fontWeight: 700, fontSize: 13 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                      name="Your Signal"
                      dataKey="value"
                      stroke={colors.accent}
                      strokeWidth={3}
                      fill={colors.accent}
                      fillOpacity={0.15}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Bars with Percentages */}
            <div className="space-y-4">
              {rolePercentages.map((item, idx) => {
                const itemColors = roleColors[item.role];
                const ItemIcon = roleIcons[item.role];
                return (
                  <motion.div
                    key={item.role}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.08 }}
                    className={`p-4 rounded-xl border-2 ${idx === 0 ? `${itemColors.border} ${itemColors.light}` : 'border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <ItemIcon className={`w-5 h-5 ${itemColors.text}`} />
                        <span className="font-bold text-sm uppercase tracking-wider">{item.role}</span>
                        {idx === 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${itemColors.bg} text-white`}>
                            PRIMARY
                          </span>
                        )}
                        {idx === 1 && !comboProfile?.isPure && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            SECONDARY
                          </span>
                        )}
                      </div>
                      <span className="font-black text-xl tabular-nums">{item.percentage}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                        className={`h-full ${itemColors.bg} rounded-full`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* ── STRESS RADIATION MAP ── */}
        {stressZones.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
              Stress Radiation Map
            </h2>
            <p className="text-gray-500 mb-2">
              <strong>What this is:</strong> an estimate of how much friction you'd likely feel operating as each of the other four roles, based on how far they sit from your natural energy. Every hour spent fighting your wiring is an hour stolen from your best self.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              This is a modeled estimate derived from your energy distribution — not a separately measured stress score. We're working on incorporating real feedback (self-reported stress, manager input) to turn this into a direct measurement over time.
            </p>

            <div className="space-y-4">
              {stressZones.map((zone, idx) => {
                const ZoneIcon = roleIcons[zone.targetRole];
                const zoneColors = roleColors[zone.targetRole];
                const isNatural = zone.stressLevel <= 10;
                const isDanger = zone.stressLevel > 55;

                return (
                  <motion.div
                    key={zone.targetRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                    className={`p-5 md:p-6 rounded-2xl border-2 transition-all ${
                      isNatural ? `${zoneColors.border} ${zoneColors.light}` :
                      isDanger ? 'border-red-200 bg-red-50/50' :
                      'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-xl ${isNatural ? zoneColors.bg + ' text-white' : isDanger ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                        <ZoneIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg">Operating as {zone.targetRole}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isNatural ? 'bg-emerald-100 text-emerald-700' :
                              zone.stressLevel <= 30 ? 'bg-green-100 text-green-700' :
                              zone.stressLevel <= 55 ? 'bg-yellow-100 text-yellow-700' :
                              zone.stressLevel <= 75 ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {zone.label}
                            </span>
                          </div>
                        </div>

                        <StressGauge level={zone.stressLevel} label="Friction Level (Est.)" />

                        <p className="text-sm text-gray-600 leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                          {zone.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                          {isDanger ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          ) : isNatural ? (
                            <Flame className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span className={`font-medium ${isDanger ? 'text-red-600' : isNatural ? 'text-emerald-600' : 'text-gray-500'}`}>
                            Energy Cost: {zone.energyCost}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── BEST SELF INSIGHT ── */}
        {bestSelfInsight && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-200 p-8 md:p-12 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-amber-500" />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">Your Path to Your Best Self</span>
              </div>
              <p className="text-lg md:text-xl leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {bestSelfInsight}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── Deep Analysis ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">
            Deep Analysis
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-6 md:p-8 rounded-2xl ${colors.light} border-2 ${colors.border}`}>
              <h3 className={`text-sm font-bold uppercase tracking-[0.2em] ${colors.text} mb-3`}>
                Your Superpower
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {insights.superpower}
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-red-50 border-2 border-red-200">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-red-600 mb-3">
                Your Blind Spot
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {insights.blindSpot}
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-orange-50 border-2 border-orange-200">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600 mb-3">
                Under Stress — What Happens When You're Forced Out
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {insights.underStress} <strong>This is the cost of operating outside your nature — it doesn't just reduce performance, it reduces your possibility as a human being.</strong>
              </p>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-emerald-50 border-2 border-emerald-200">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 mb-3">
                Your Growth Edge
              </h3>
              <p className="text-base md:text-lg leading-relaxed text-gray-800" style={{ textWrap: 'pretty' as any }}>
                {insights.growthEdge}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Team Dynamics ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">
            Team Dynamics
          </h2>

          <div className="bg-black text-white p-6 md:p-10 rounded-2xl space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                What You Bring to the Team
              </h3>
              <p className="text-lg md:text-xl leading-relaxed text-gray-200" style={{ textWrap: 'pretty' as any }}>
                {insights.teamValue}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-5 rounded-xl">
                <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-green-400 mb-3">
                  Best Paired With
                </h4>
                <div className="space-y-2">
                  {insights.bestWith.map(role => {
                    const PairIcon = roleIcons[role];
                    return (
                      <div key={role} className="flex items-center gap-3">
                        <PairIcon className={`w-5 h-5 ${roleColors[role].text}`} />
                        <span className="font-bold">{role}</span>
                        <span className="text-gray-400 text-sm">— {roleDescriptions[role].description.split('.')[0]}.</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {insights.frictionWith.length > 0 && (
                <div className="bg-white/10 p-5 rounded-xl">
                  <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-red-400 mb-3">
                    Potential Friction With
                  </h4>
                  <div className="space-y-2">
                    {insights.frictionWith.map(role => {
                      const FrictionIcon = roleIcons[role];
                      return (
                        <div key={role} className="flex items-center gap-3">
                          <FrictionIcon className={`w-5 h-5 ${roleColors[role].text}`} />
                          <span className="font-bold">{role}</span>
                          <span className="text-gray-400 text-sm">— different operational wavelength</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/20 pt-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 mb-3">
                Communication Guide
              </h4>
              <p className="text-gray-300 text-sm mb-3">How others should communicate with you:</p>
              <div className="text-gray-200 text-base leading-relaxed whitespace-pre-line" style={{ textWrap: 'pretty' as any }}>
                {description.communicationGuide.trim()}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Your Mantra ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Your Mantra</p>
          <p className={`text-2xl md:text-4xl font-black italic ${colors.text}`} style={{ textWrap: 'balance' as any }}>
            {insights.mantra}
          </p>
        </motion.section>

        {/* ── Shareable Card ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
            Share Your Results
          </h2>
          <p className="text-gray-500 mb-6">
            Download your Flow Circuit card and share it on LinkedIn, Instagram, or with your team.
          </p>
          {comboProfile && (
            <ShareableCard
              name={guestName}
              comboProfile={comboProfile}
              rolePercentages={rolePercentages}
              dominantRole={dominant}
            />
          )}
        </motion.section>

        {/* ── Invite Tribe — Prominent CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="bg-black text-white rounded-2xl p-6 md:p-10 space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                Find Your Tribe
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Your report is just the start. Share this link with your team or family — when everyone maps their energy, you unlock the full dynamic.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-white/10 border border-white/20 rounded-xl p-4 space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={domain
                    ? `${window.location.origin}/assessment?domain=${encodeURIComponent(domain)}`
                    : `${window.location.origin}/assessment`
                  }
                  className="bg-black/50 text-white text-sm flex-1 outline-none rounded-lg px-3 py-2 border border-white/10 truncate"
                />
                <Button
                  onClick={handleCopyInvite}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-6 shrink-0"
                >
                  {copiedInvite ? <><CheckCircle2 className="mr-1 h-4 w-4" /> Copied!</> : <><Copy className="mr-1 h-4 w-4" /> Copy</>}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Send this to colleagues or family members. Their results auto-join the {domain || "group"} map.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── 360° Peer Review — Live Link Generator ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
        >
          {assessmentId && (
            <ThreeSixtyLinkGenerator
              assessmentId={Number(assessmentId)}
              subjectName={guestName || "You"}
              subjectEmail={localStorage.getItem("assessment_guest_email") || undefined}
              selfScores={selfData?.scores ? Object.fromEntries(
                Object.entries(selfData.scores).map(([k, v]) => [k.toLowerCase(), Number(v)])
              ) : undefined}
              domain={domain}
            />
          )}
        </motion.section>

        {/* ── Soulprint Teaser ── */}
        {(() => {
          const hasBirthData = !!localStorage.getItem("assessment_birth_date");
          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58 }}
              className="relative overflow-hidden rounded-3xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-8 md:p-10"
            >
              <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Coming Soon
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-purple-900">
                    Your Soulprint
                  </h2>
                  <p className="text-purple-700 mt-1 text-sm">
                    The deeper layer beneath your Flow Circuit
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4" style={{ textWrap: 'pretty' as any }}>
                Your Flow Circuit reveals <strong>what</strong> you do on a team. Your Soulprint reveals <strong>why</strong> you do it that way.
                It maps your birth data across 8+ personality frameworks — Enneagram, Human Design, Gene Keys,
                Western & Vedic & Chinese Astrology, Spiral Dynamics, and Numerology — to create a multi-dimensional
                portrait of your operating system.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {['Enneagram', 'Human Design', 'Gene Keys', 'Astrology'].map((fw) => (
                  <div key={fw} className="text-center p-3 rounded-xl bg-white/60 border border-purple-100">
                    <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-xs">✨</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{fw}</p>
                    <p className="text-[9px] text-purple-400 mt-0.5">Generating...</p>
                  </div>
                ))}
              </div>

              {hasBirthData ? (
                <div className="bg-white/80 rounded-2xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <p className="font-bold text-green-800">Birth data saved</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your Soulprint report will be automatically generated when the service launches —
                    expected in the next couple of weeks. We'll notify you when it's ready.
                    It will appear right here, seamlessly integrated with your Flow Circuit results.
                  </p>
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-5 border border-purple-200">
                  <p className="text-sm text-gray-600 mb-3">
                    You skipped the Soulprint step earlier — no worries! You can add your birth data anytime
                    to unlock this report when it launches.
                  </p>
                  <Button
                    onClick={() => {
                      // Go back to assessment with a flag to show only the birth data step
                      localStorage.setItem("fc_soulprint_retake", "true");
                      router.push("/assessment");
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700 font-bold gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Add My Birth Data for Soulprint
                  </Button>
                </div>
              )}
            </motion.section>
          );
        })()}

        {/* ── Go Deeper: Deep Calibration CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.59 }}
        >
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <Shield className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                      Go Deeper
                    </h2>
                    <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-emerald-200 mt-1 text-base leading-relaxed" style={{ textWrap: 'pretty' as any }}>
                    Your Likert-based assessment captures your intuitive signal. Deep Calibration uses forced-ranking, which tends to reduce the "rate everything high" bias that Likert scales are prone to — giving you a more differentiated profile. It's a more rigorous self-report pass, not an independently audited or clinically validated score.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-emerald-300">15</p>
                  <p className="text-xs text-emerald-200/70 mt-1 uppercase tracking-wider">Forced-Rank Scenarios</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-emerald-300">~10 min</p>
                  <p className="text-xs text-emerald-200/70 mt-1 uppercase tracking-wider">To Complete</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-emerald-100 leading-relaxed">
                  <strong className="text-white">How it works:</strong> You'll rank 8 sets of role-specific behaviors from "most like me" to "least like me." Unlike the standard assessment where you can rate everything high, forced-ranking reveals your true hierarchy — the roles you actually default to when resources are scarce.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/deep-calibration")}
                  className="flex-1 bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold py-5 text-base"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Start Deep Calibration
                </Button>
                <Button
                  onClick={() => router.push("/efficacy")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 font-bold py-5"
                >
                  View the Science
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Research Opt-In ── */}
        {assessmentId && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.595 }}
          >
            <ResearchOptIn assessmentId={Number(assessmentId)} />
          </motion.section>
        )}

        {/* ── Next Steps CTAs ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-6">
            What's Next
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Share Your Card */}
            <button
              onClick={() => router.push("/share-card")}
              className="group p-6 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/50 transition-all text-left"
            >
              <Sparkles className="w-8 h-8 mb-3 text-amber-400 group-hover:text-amber-600 transition-colors" />
              <h3 className="font-bold text-lg mb-1">Share Your Card</h3>
              <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                Generate a visual card of your Flow Circuit role and share it on LinkedIn.
              </p>
              <ChevronRight className="w-5 h-5 mt-3 text-amber-300 group-hover:text-amber-600 transition-colors" />
            </button>

            {domain && (
              <button
                onClick={() => router.push(`/team-map?domain=${encodeURIComponent(domain)}`)}
                className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-black transition-all text-left"
              >
                <Share2 className="w-8 h-8 mb-3 text-gray-400 group-hover:text-black transition-colors" />
                <h3 className="font-bold text-lg mb-1">View Tribe Map</h3>
                <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                  See how your tribe's energy is distributed across the Flow Circuit.
                </p>
                <ChevronRight className="w-5 h-5 mt-3 text-gray-300 group-hover:text-black transition-colors" />
              </button>
            )}

            <button
              onClick={() => router.push("/family")}
              className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all text-left"
            >
              <Heart className="w-8 h-8 mb-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <h3 className="font-bold text-lg mb-1">Family Circuit</h3>
              <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                Map your family's energy dynamics. Home is where you should be yourself.
              </p>
              <ChevronRight className="w-5 h-5 mt-3 text-gray-300 group-hover:text-purple-500 transition-colors" />
            </button>

            <button
              onClick={() => router.push("/soulprint")}
              className="group p-6 rounded-2xl border-2 border-indigo-200 hover:border-indigo-500 transition-all text-left"
            >
              <Compass className="w-8 h-8 mb-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
              <h3 className="font-bold text-lg mb-1">SoulPrint</h3>
              <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                Map your soul's blueprint. Combine it with your Flow Circuit DNA for the full picture.
              </p>
              <ChevronRight className="w-5 h-5 mt-3 text-indigo-300 group-hover:text-indigo-600 transition-colors" />
            </button>

            <button
              onClick={() => {
                const assessmentId = localStorage.getItem("flowcircuit_assessment_id");
                router.push(assessmentId ? `/consciousness/${assessmentId}` : "/consciousness");
              }}
              className="group p-6 rounded-2xl border-2 border-violet-200 hover:border-violet-500 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <Eye className="w-8 h-8 mb-3 text-violet-400 group-hover:text-violet-600 transition-colors" />
                <h3 className="font-bold text-lg mb-1">Consciousness Layer</h3>
                <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                  Toggle in your SoulPrint reading — Enneagram, Human Design, Astrology — for a deeper lens on your Flow Circuit role.
                </p>
                <ChevronRight className="w-5 h-5 mt-3 text-violet-300 group-hover:text-violet-600 transition-colors" />
              </div>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("fc_assessment_session");
                localStorage.removeItem("assessment_results");
                router.push("/assessment");
              }}
              className="group p-6 rounded-2xl border-2 border-gray-200 hover:border-black transition-all text-left"
            >
              <ArrowRight className="w-8 h-8 mb-3 text-gray-400 group-hover:text-black transition-colors" />
              <h3 className="font-bold text-lg mb-1">Retake Assessment</h3>
              <p className="text-sm text-gray-500" style={{ textWrap: 'pretty' as any }}>
                Answer from a different context (work vs. family) to see how your energy shifts.
              </p>
              <ChevronRight className="w-5 h-5 mt-3 text-gray-300 group-hover:text-black transition-colors" />
            </button>
          </div>

          {/* ── Find Your Me — TonyG Ecosystem ── */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Find Your Me</h3>
            <p className="text-sm text-gray-500 mb-6" style={{ textWrap: 'pretty' as any }}>
              Your Flow Circuit role is one layer. Go deeper across the full ecosystem of self-discovery tools.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <a
                href="https://tonygreenb-gxhndhxp.manus.space/assessment"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-all"
              >
                <Compass className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm">Identity Assessment</div>
                  <div className="text-xs text-gray-500">5 questions. Who are you when systems break?</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </a>
              <a
                href="https://tonygreenb-gxhndhxp.manus.space/amplifier"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-all"
              >
                <TrendingUp className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm">The Amplifier</div>
                  <div className="text-xs text-gray-500">Expand the arena you get to play in.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </a>
              <a
                href="https://tonygreenb-gxhndhxp.manus.space/diamond-cut"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-all"
              >
                <Gem className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm">The Diamond Cut</div>
                  <div className="text-xs text-gray-500">Find the product trapped inside your services business.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </a>
              <a
                href="https://tonygreenb-gxhndhxp.manus.space/essays"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-yellow-500 hover:bg-yellow-50/50 transition-all"
              >
                <BookOpen className="w-5 h-5 text-yellow-600 shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm">109 Essays</div>
                  <div className="text-xs text-gray-500">15 years of thinking on identity, capital, and consciousness.</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </a>
            </div>
          </div>
        </motion.section>

        {/* ── Download Report ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex justify-center py-6 print:hidden"
        >
          <Button
            onClick={() => {
              // Add print-optimized class to body for better PDF output
              document.body.classList.add('printing-report');
              setTimeout(() => {
                window.print();
                document.body.classList.remove('printing-report');
              }, 100);
            }}
            className={`${colors.bg} text-white hover:opacity-90 px-10 py-6 text-lg font-bold uppercase tracking-wider gap-3`}
          >
            <Download className="w-5 h-5" />
            Download Full Report as PDF
          </Button>
        </motion.div>

        {/* ── BlogBridge ── */}
        <BlogBridge pageKey="results" />

        {/* ── Footer Disclaimer ── */}
        <div className="text-center text-xs text-gray-400 pt-8 border-t border-gray-100">
          <p>The Flow Circuit Assessment is a proprietary operational framework.</p>
          <p className="mt-1">
            Scoring methodology: Ipsative forced-choice measurement across 12 items, 3 behavioral domains
            (Behavioral Orientation, Cognitive Style, Interpersonal Dynamics). Construct validity derived from
            established team-role frameworks (Belbin, Team Dimensions Profile, Z Process).
          </p>
          <p className="mt-1">&copy; 2000-2026 Tony Greenberg and RampRate. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
