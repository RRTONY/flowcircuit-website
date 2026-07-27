"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  calibrationSets,
  calculateCalibratedScores,
  calculateConsistency,
  scoresToPercentages,
  getDominantRole,
  type RankingResult,
} from "@/lib/calibrationData";
import type { Role } from "@/lib/surveyData";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  GripVertical,
  CheckCircle2,
  Zap,
  Target,
  BarChart3,
  ArrowUpDown,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const ROLE_COLORS: Record<Role, string> = {
  Spark: "text-amber-400",
  Amplifier: "text-cyan-400",
  Filter: "text-rose-400",
  Ground: "text-emerald-400",
  Conductor: "text-violet-400",
};

const ROLE_BG: Record<Role, string> = {
  Spark: "bg-amber-500/10 border-amber-500/30",
  Amplifier: "bg-cyan-500/10 border-cyan-500/30",
  Filter: "bg-rose-500/10 border-rose-500/30",
  Ground: "bg-emerald-500/10 border-emerald-500/30",
  Conductor: "bg-violet-500/10 border-violet-500/30",
};

export default function DeepCalibrationClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "calibrating" | "submitting" | "results">("intro");
  const [currentSet, setCurrentSet] = useState(0);
  const [rankings, setRankings] = useState<RankingResult[]>([]);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [results, setResults] = useState<{
    scores: Record<Role, number>;
    percentages: Record<Role, number>;
    role: Role;
    consistency: number;
    originalRole?: string;
    originalScores?: Record<string, number>;
  } | null>(null);

  // Get user's latest assessment
  const { data: myResults } = trpc.assessment.myResults.useQuery(undefined, {
    enabled: !!user,
  });

  const latestAssessment = useMemo(() => {
    if (!myResults?.length) return null;
    return myResults[0];
  }, [myResults]);

  const saveCalibration = trpc.assessment.saveCalibration.useMutation({
    onSuccess: (data: any) => {
      setResults({
        scores: data.calibratedScores,
        percentages: scoresToPercentages(data.calibratedScores),
        role: data.calibratedRole,
        consistency: data.confidenceScore,
        originalRole: latestAssessment?.role,
        originalScores: latestAssessment?.scores as Record<string, number> | undefined,
      });
      setPhase("results");
      toast.success("Deep Calibration complete!");
    },
    onError: () => {
      toast.error("Failed to save calibration. Please try again.");
      setPhase("calibrating");
    },
  });

  const startCalibration = useCallback(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!latestAssessment) {
      toast.error("Take the Flow Circuit assessment first");
      router.push("/assessment");
      return;
    }
    setPhase("calibrating");
    setCurrentSet(0);
    setRankings([]);
    // Initialize first set order
    setCurrentOrder(calibrationSets[0].statements.map(s => s.id));
  }, [user, latestAssessment, router]);

  const handleNext = useCallback(() => {
    // Save current ranking
    const newRankings = [...rankings, { setId: calibrationSets[currentSet].id, rankings: currentOrder }];
    setRankings(newRankings);

    if (currentSet < calibrationSets.length - 1) {
      const nextSet = currentSet + 1;
      setCurrentSet(nextSet);
      setCurrentOrder(calibrationSets[nextSet].statements.map(s => s.id));
    } else {
      // All done — submit
      setPhase("submitting");
      const scores = calculateCalibratedScores(newRankings);
      const consistency = calculateConsistency(newRankings);
      const role = getDominantRole(scores);

      saveCalibration.mutate({
        assessmentId: latestAssessment!.id,
        rankings: newRankings,
        calibratedScores: scores,
        calibratedRole: role,
        originalScores: (latestAssessment?.scores as Record<string, number>) || {},
        originalRole: latestAssessment?.role || "",
        confidenceScore: consistency,
      });
    }
  }, [currentSet, currentOrder, rankings, latestAssessment, saveCalibration]);

  const handleBack = useCallback(() => {
    if (currentSet > 0) {
      const prevSet = currentSet - 1;
      setCurrentSet(prevSet);
      // Restore previous ranking if it exists
      const prevRanking = rankings[prevSet];
      if (prevRanking) {
        setCurrentOrder(prevRanking.rankings);
        setRankings(rankings.slice(0, prevSet));
      } else {
        setCurrentOrder(calibrationSets[prevSet].statements.map(s => s.id));
      }
    }
  }, [currentSet, rankings]);

  const currentSetData = calibrationSets[currentSet];
  const progress = ((currentSet + 1) / calibrationSets.length) * 100;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        {/* --- INTRO --- */}
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center px-4"
          >
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium"
              >
                <Shield className="w-4 h-4" />
                Verified Assessment
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Deep Calibration
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                The standard assessment tells you who you are.
                This tells you who you <em>can't pretend not to be</em>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-5 space-y-2">
                    <ArrowUpDown className="w-5 h-5 text-violet-400" />
                    <h3 className="font-semibold text-sm">Forced Ranking</h3>
                    <p className="text-xs text-muted-foreground">
                      No more rating everything high.
                      You rank 4 statements from most
                      to least like you. The data
                      forces honest differentiation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-5 space-y-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-sm">Ipsative Scoring</h3>
                    <p className="text-xs text-muted-foreground">
                      Same method as Gallup
                      CliftonStrengths and Belbin.
                      Your scores show energy
                      distribution, not absolutes.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-5 space-y-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-sm">Verified Badge</h3>
                    <p className="text-xs text-muted-foreground">
                      Completing calibration earns
                      a "Verified" badge on your
                      profile — proof your role
                      assignment is battle-tested.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  15 scenarios. Drag to rank. About 10 minutes.
                </p>
                {!latestAssessment && user && (
                  <p className="text-sm text-amber-400">
                    You need to complete the Flow Circuit assessment first.
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={startCalibration}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8"
                >
                  {!user ? "Sign In to Start" : !latestAssessment ? "Take Assessment First" : "Begin Calibration"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- CALIBRATING --- */}
        {phase === "calibrating" && currentSetData && (
          <motion.div
            key={`set-${currentSet}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
          >
            {/* Progress bar */}
            <div className="w-full max-w-xl mb-8">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Set {currentSet + 1} of {calibrationSets.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-violet-500 rounded-full"
                  initial={{ width: `${((currentSet) / calibrationSets.length) * 100}%` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Context */}
            <div className="max-w-xl w-full mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">
                {currentSetData.context}
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                Drag to rank from <strong className="text-violet-400">most like you</strong> (top)
                to <strong className="text-muted-foreground">least like you</strong> (bottom)
              </p>
            </div>

            {/* Rank labels */}
            <div className="max-w-xl w-full space-y-0">
              <Reorder.Group
                axis="y"
                values={currentOrder}
                onReorder={setCurrentOrder}
                className="space-y-3"
              >
                {currentOrder.map((stmtId, index) => {
                  const stmt = currentSetData.statements.find(s => s.id === stmtId)!;
                  const rankLabels = ["Most Like Me", "Somewhat Like Me", "Less Like Me", "Least Like Me"];
                  const rankColors = [
                    "border-violet-500/50 bg-violet-500/10",
                    "border-blue-500/30 bg-blue-500/5",
                    "border-muted/30 bg-muted/5",
                    "border-muted/20 bg-muted/5 opacity-70",
                  ];

                  return (
                    <Reorder.Item
                      key={stmtId}
                      value={stmtId}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-colors ${rankColors[index]}`}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0 8px 32px rgba(139, 92, 246, 0.3)",
                        zIndex: 50,
                      }}
                    >
                      <div className="flex flex-col items-center gap-1 min-w-[24px]">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">
                          {stmt.text}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {rankLabels[index]}
                        </p>
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentSet > 0 && (
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-8"
              >
                {currentSet === calibrationSets.length - 1 ? (
                  <>Complete <CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- SUBMITTING --- */}
        {phase === "submitting" && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Target className="w-12 h-12 text-violet-400 mx-auto" />
              </motion.div>
              <p className="text-lg font-medium">Recalibrating your profile...</p>
              <p className="text-sm text-muted-foreground">
                Running ipsative analysis across
                60 data points
              </p>
            </div>
          </motion.div>
        )}

        {/* --- RESULTS --- */}
        {phase === "results" && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen py-16 px-4"
          >
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Verified Profile
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Calibration Complete
                </h1>
                <p className="text-muted-foreground">
                  Consistency Score: <strong className={results.consistency >= 70 ? "text-emerald-400" : results.consistency >= 50 ? "text-amber-400" : "text-rose-400"}>
                    {results.consistency}%
                  </strong>
                  {results.consistency >= 70 ? " — Highly consistent" : results.consistency >= 50 ? " — Moderately consistent" : " — Low consistency (retake recommended)"}
                </p>
              </div>

              {/* Role Result */}
              <Card className={`border-2 ${ROLE_BG[results.role]}`}>
                <CardContent className="p-8 text-center space-y-4">
                  <Sparkles className={`w-10 h-10 mx-auto ${ROLE_COLORS[results.role]}`} />
                  <h2 className="text-2xl font-bold">
                    Calibrated Role: <span className={ROLE_COLORS[results.role]}>{results.role}</span>
                  </h2>
                  {results.originalRole && results.originalRole !== results.role && (
                    <p className="text-sm text-muted-foreground">
                      Original assessment: <span className="text-foreground">{results.originalRole}</span> →
                      Calibrated: <span className={ROLE_COLORS[results.role]}>{results.role}</span>
                    </p>
                  )}
                  {results.originalRole && results.originalRole === results.role && (
                    <p className="text-sm text-emerald-400">
                      Confirmed — your original role held up under forced ranking
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Score Comparison */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-400" />
                    Score Comparison
                  </h3>
                  <div className="space-y-3">
                    {(["Spark", "Amplifier", "Filter", "Ground", "Conductor"] as Role[]).map(role => {
                      const calibPct = results.percentages[role];
                      const origPct = results.originalScores
                        ? Math.round(
                            ((results.originalScores[role] || 0) /
                              Math.max(1, Object.values(results.originalScores).reduce((a, b) => a + b, 0))) * 100
                          )
                        : 0;
                      const delta = calibPct - origPct;

                      return (
                        <div key={role} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={`font-medium ${ROLE_COLORS[role]}`}>{role}</span>
                            <span className="text-muted-foreground">
                              {origPct}% → <strong className="text-foreground">{calibPct}%</strong>
                              {delta !== 0 && (
                                <span className={delta > 0 ? "text-emerald-400 ml-1" : "text-rose-400 ml-1"}>
                                  ({delta > 0 ? "+" : ""}{delta})
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            {/* Original score (faded) */}
                            <div
                              className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded-full"
                              style={{ width: `${origPct}%` }}
                            />
                            {/* Calibrated score */}
                            <motion.div
                              className={`absolute inset-y-0 left-0 rounded-full ${
                                role === "Spark" ? "bg-amber-500" :
                                role === "Amplifier" ? "bg-cyan-500" :
                                role === "Filter" ? "bg-rose-500" :
                                role === "Ground" ? "bg-emerald-500" :
                                "bg-violet-500"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${calibPct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Faded bars show your original Likert scores.
                    Solid bars show your forced-rank calibrated scores.
                    The gap reveals where social desirability
                    bias was inflating or deflating your profile.
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/results")}
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                >
                  <Zap className="w-4 h-4" /> View Full Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/share-card")}
                  className="gap-2"
                >
                  Share Your Verified Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhase("intro");
                    setRankings([]);
                    setCurrentSet(0);
                  }}
                  className="gap-2"
                >
                  Retake Calibration
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
