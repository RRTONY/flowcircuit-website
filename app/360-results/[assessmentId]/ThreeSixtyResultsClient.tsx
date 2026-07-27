"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import ThreeSixtyLinkGenerator from "@/components/ThreeSixtyLinkGenerator";

const ROLES = ["spark", "amplifier", "filter", "ground", "conductor"];
const ROLE_LABELS: Record<string, string> = {
  spark: "Spark",
  amplifier: "Amplifier",
  filter: "Filter",
  ground: "Ground",
  conductor: "Conductor",
};
const ROLE_COLORS: Record<string, string> = {
  spark: "#F59E0B",
  amplifier: "#8B5CF6",
  filter: "#3B82F6",
  ground: "#10B981",
  conductor: "#EC4899",
};

export default function ThreeSixtyResultsClient({ assessmentId: assessmentIdProp }: { assessmentId: string }) {
  const router = useRouter();
  const assessmentId = assessmentIdProp
    ? parseInt(assessmentIdProp)
    : null;

  // Fetch the assessment record itself (always available)
  const { data: assessmentRecord, isLoading: assessmentLoading } = trpc.assessment.getById.useQuery(
    { id: assessmentId! },
    { enabled: !!assessmentId }
  );

  // First get the session by assessment ID
  const { data: sessionData, isLoading: sessionLoading } = trpc.threeSixty.getByAssessment.useQuery(
    { assessmentId: assessmentId! },
    { enabled: !!assessmentId, refetchInterval: 15000 }
  );

  // Then get the full status with gap report using the token
  const { data: statusData, isLoading: statusLoading } = trpc.threeSixty.getStatus.useQuery(
    { token: sessionData?.session?.token || "" },
    { enabled: !!sessionData?.session?.token, refetchInterval: 15000 }
  );

  const isLoading = assessmentLoading || sessionLoading || (!!sessionData && statusLoading);
  const data = statusData || (sessionData ? { session: sessionData.session, responseCount: sessionData.responseCount, gapReportReady: false, gapReport: null } : null);

  // Extract gap report data
  const gapReport = data?.gapReport || null;

  // Build radar chart data
  const radarData = useMemo(() => {
    if (!gapReport) return [];
    return ROLES.map((role) => {
      const label = ROLE_LABELS[role];
      return {
        subject: label,
        "How I See Myself": gapReport.selfScores?.[label] || gapReport.selfScores?.[role] || 0,
        "How Others See Me": gapReport.peerScores?.[label] || gapReport.peerScores?.[role] || 0,
      };
    });
  }, [gapReport]);

  // Gap analysis
  const gaps = useMemo(() => {
    if (!gapReport?.selfScores || !gapReport?.peerScores) return [];
    return ROLES.map((role) => {
      const label = ROLE_LABELS[role];
      const self = gapReport.selfScores[label] || gapReport.selfScores[role] || 0;
      const peers = gapReport.peerScores[label] || gapReport.peerScores[role] || 0;
      const gap = peers - self;
      return {
        role,
        label: ROLE_LABELS[role],
        color: ROLE_COLORS[role],
        self: Math.round(self),
        peers: Math.round(peers),
        gap: Math.round(gap),
        absGap: Math.abs(Math.round(gap)),
        direction: gap > 0 ? "blind_strength" : gap < 0 ? "blind_spot" : "aligned",
        insight:
          gap > 10
            ? `Others see more ${ROLE_LABELS[role]} in you than you see in yourself. This is a hidden strength — lean into it.`
            : gap < -10
              ? `You rate your ${ROLE_LABELS[role]} energy higher than others do. This gap is worth exploring — it may indicate an area where intent doesn't match impact.`
              : `Your self-perception aligns with how others experience your ${ROLE_LABELS[role]} energy.`,
      };
    }).sort((a, b) => b.absGap - a.absGap);
  }, [gapReport]);

  const biggestBlindSpot = gaps.find((g) => g.direction === "blind_spot");
  const biggestStrength = gaps.find((g) => g.direction === "blind_strength");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-pulse text-[#2C1810]/60 text-lg">
          Loading your 360 report...
        </div>
      </div>
    );
  }

  if (!data) {
    // No 360 session yet — but show assessment record + link generator
    if (assessmentRecord) {
      const scores = (assessmentRecord.scores as Record<string, number>) || {};
      return (
        <div className="min-h-screen bg-[#FAF8F5] py-8 px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            <button
              onClick={() => router.push("/results")}
              className="flex items-center gap-2 text-[#2C1810]/60 hover:text-[#2C1810] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Results</span>
            </button>

            <div className="text-center">
              <p className="text-sm uppercase tracking-widest text-[#2C1810]/50 mb-2">
                Your Assessment Record
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
                {assessmentRecord.guestName || "Your"} Flow Circuit
              </h1>
              <p className="text-lg text-[#2C1810]/80">
                Dominant Role: <span className="font-bold">{assessmentRecord.role}</span>
                {assessmentRecord.score ? ` (${assessmentRecord.score}%)` : ""}
              </p>
            </div>

            {/* Score breakdown */}
            {Object.keys(scores).length > 0 && (
              <Card className="border-[#E8DDD3]">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[#2C1810] mb-4">Your Energy Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(scores).sort(([,a], [,b]) => (b as number) - (a as number)).map(([role, score]) => (
                      <div key={role} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium text-[#2C1810]">{role}</span>
                        <div className="flex-1 h-3 bg-[#E8DDD3] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, ((score as number) / 120) * 100)}%`,
                              backgroundColor: ROLE_COLORS[role.toLowerCase()] || "#666",
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-sm font-mono text-[#2C1810]/70">{score as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 360 Link Generator */}
            {assessmentId && (
              <ThreeSixtyLinkGenerator
                assessmentId={assessmentId}
                subjectName={assessmentRecord.guestName || "You"}
                domain={assessmentRecord.domain || undefined}
              />
            )}
          </div>
        </div>
      );
    }

    // No assessment record at all
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-[#E8DDD3]">
          <CardContent className="p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-[#2C1810]">
              Assessment Not Found
            </h2>
            <p className="text-[#2C1810]/60">
              We couldn't find an assessment with this ID. Take the
              assessment first to get your Flow Circuit results.
            </p>
            <Button
              onClick={() => router.push("/assessment")}
              className="bg-[#2C1810] hover:bg-[#1a0f0a] text-white"
            >
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const responseCount = data.responseCount || 0;
  const needsMore = responseCount < 3;
  const subjectName = data.session?.subjectName || "You";
  const firstName = subjectName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back button */}
        <button
          onClick={() => router.push("/results")}
          className="flex items-center gap-2 text-[#2C1810]/60 hover:text-[#2C1810] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Results</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm uppercase tracking-widest text-[#2C1810]/50 mb-2">
            360 Gap Report
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-2">
            {firstName}'s Perception Gap
          </h1>
          <p className="text-[#2C1810]/60 max-w-lg mx-auto">
            How you see yourself vs. how others experience you.
            The gap is where growth lives.
          </p>
        </motion.div>

        {/* Response Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-[#E8DDD3]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="#E8DDD3"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={responseCount >= 3 ? "#10B981" : "#F59E0B"}
                        strokeWidth="4"
                        strokeDasharray={`${(Math.min(responseCount, 5) / 5) * 176} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#2C1810]">
                      {responseCount}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#2C1810]">
                      {responseCount} response{responseCount !== 1 ? "s" : ""}{" "}
                      received
                    </p>
                    <p className="text-sm text-[#2C1810]/60">
                      {needsMore
                        ? `Need ${3 - responseCount} more for gap report`
                        : "Gap report unlocked!"}
                    </p>
                  </div>
                </div>
                {responseCount >= 3 && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* If not enough responses, show link generator */}
        {needsMore && assessmentId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ThreeSixtyLinkGenerator
              assessmentId={assessmentId}
              subjectName={subjectName}
              domain={data.session?.teamSlug || undefined}
            />
          </motion.div>
        )}

        {/* Gap Report — only show if 3+ responses */}
        {!needsMore && (
          <>
            {/* Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-[#E8DDD3]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#2C1810] text-lg mb-4 text-center">
                    Self vs. Peer Perception
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#E8DDD3" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#2C1810", fontSize: 12 }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#2C1810", fontSize: 10 }}
                      />
                      <Radar
                        name="How I See Myself"
                        dataKey="How I See Myself"
                        stroke="#2C1810"
                        fill="#2C1810"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Radar
                        name="How Others See Me"
                        dataKey="How Others See Me"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {biggestBlindSpot && (
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <EyeOff className="w-5 h-5 text-red-500" />
                      <h4 className="font-bold text-red-900 text-sm uppercase tracking-wide">
                        Biggest Blind Spot
                      </h4>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: biggestBlindSpot.color }}>
                      {biggestBlindSpot.label}
                    </p>
                    <p className="text-sm text-red-800/70">
                      You rate yourself {biggestBlindSpot.absGap}% higher than
                      peers do. {biggestBlindSpot.insight}
                    </p>
                  </CardContent>
                </Card>
              )}

              {biggestStrength && (
                <Card className="border-emerald-200 bg-emerald-50/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-emerald-500" />
                      <h4 className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
                        Hidden Strength
                      </h4>
                    </div>
                    <p className="text-2xl font-bold mb-1" style={{ color: biggestStrength.color }}>
                      {biggestStrength.label}
                    </p>
                    <p className="text-sm text-emerald-800/70">
                      Peers see {biggestStrength.absGap}% more of this in you
                      than you claim. {biggestStrength.insight}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Full Gap Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-[#E8DDD3]">
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#2C1810] text-lg mb-4">
                    Full Gap Breakdown
                  </h3>
                  <div className="space-y-4">
                    {gaps.map((g) => (
                      <div key={g.role} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: g.color }}
                          >
                            {g.label}
                          </span>
                          <span className="text-xs text-[#2C1810]/60">
                            Self: {g.self}% | Peers: {g.peers}% |{" "}
                            <span
                              className={
                                g.gap > 5
                                  ? "text-emerald-600 font-medium"
                                  : g.gap < -5
                                    ? "text-red-600 font-medium"
                                    : "text-[#2C1810]/60"
                              }
                            >
                              Gap: {g.gap > 0 ? "+" : ""}
                              {g.gap}%
                            </span>
                          </span>
                        </div>
                        {/* Bar visualization */}
                        <div className="flex gap-1 h-3">
                          <div
                            className="rounded-l-full bg-[#2C1810]/20"
                            style={{ width: `${g.self}%` }}
                            title={`Self: ${g.self}%`}
                          />
                          <div
                            className="rounded-r-full"
                            style={{
                              width: `${g.peers}%`,
                              backgroundColor: g.color,
                              opacity: 0.6,
                            }}
                            title={`Peers: ${g.peers}%`}
                          />
                        </div>
                        <p className="text-xs text-[#2C1810]/50">{g.insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-[#E8DDD3] bg-[#2C1810] text-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-amber-400" />
                    <h3 className="font-bold text-lg">
                      What To Do With This
                    </h3>
                  </div>
                  <div className="space-y-3 text-sm text-white/80">
                    {biggestBlindSpot && (
                      <div className="flex gap-3">
                        <span className="text-amber-400 font-bold shrink-0">
                          01
                        </span>
                        <p>
                          <strong className="text-white">
                            Investigate your {biggestBlindSpot.label} gap.
                          </strong>{" "}
                          Ask a trusted colleague: "When do you see me
                          trying to be the {biggestBlindSpot.label} but
                          it doesn't land?" Their answer will be specific
                          and actionable.
                        </p>
                      </div>
                    )}
                    {biggestStrength && (
                      <div className="flex gap-3">
                        <span className="text-amber-400 font-bold shrink-0">
                          02
                        </span>
                        <p>
                          <strong className="text-white">
                            Lean into your hidden {biggestStrength.label}.
                          </strong>{" "}
                          Others see this in you more than you claim it.
                          Name it. Own it. Use it deliberately in your
                          next project kickoff.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <span className="text-amber-400 font-bold shrink-0">
                        03
                      </span>
                      <p>
                        <strong className="text-white">
                          Share this with your team.
                        </strong>{" "}
                        When everyone on the team does a 360, you can
                        see the full relay — who's covering what, where
                        the handoff friction lives, and what role the
                        team is missing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-[#2C1810]/40">
            Based on {responseCount} peer review{responseCount !== 1 ? "s" : ""}.
            Responses are aggregated anonymously — you never see
            individual rankings.
          </p>
        </div>
      </div>
    </div>
  );
}
