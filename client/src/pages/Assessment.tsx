import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ArrowRight, CheckCircle2, AlertTriangle, Clock, MapPin, Calendar, User, Mail, Users, Building2 } from "lucide-react";
import { surveyQuestions, calculateRoleScores, getDominantRole, type RankingAnswer } from "@/lib/surveyData";
import RankableQuestion from "@/components/RankableQuestion";
import { logAssessmentData } from "@/lib/dataLogger";
import { useLocation } from "wouter";
import SEO from '@/components/SEO';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { saveAssessmentToHistory, markAssessmentCompleted, hasCompletedAssessment, getLatestAssessment, type PersistedAssessment } from "@/lib/assessmentPersistence";
import ThreeSixtyLinkGenerator from "@/components/ThreeSixtyLinkGenerator";
import { Copy, Share2, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// Mulberry32 PRNG — better distribution than LCG, no positional bias
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with Mulberry32 PRNG — unbiased uniform distribution
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  const rng = mulberry32(seed);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SESSION_KEY = "fc_assessment_session";

interface SavedSession {
  phase: "intro" | "name" | "questions" | "birth" | "submitting" | "complete" | "invite360";
  currentQuestionIndex: number;
  answers: Record<number, string | RankingAnswer>;
  guestName: string;
  guestEmail: string;
  birthData: { date: string; time: string; city: string };
  sessionSeed: number;
  assessmentId: number | null;
  timestamp: number;
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SavedSession;
    // Expire sessions older than 2 hours
    if (Date.now() - session.timestamp > 2 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export default function Assessment() {
  const saved = useMemo(() => loadSession(), []);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // ─── Fix #2: Show results dashboard for returning users ───
  const searchParamsInit = useMemo(() => new URLSearchParams(window.location.search), []);
  const isRetake = searchParamsInit.get("retake") === "true";
  
  // Check localStorage first for completion
  const completionCheck = useMemo(() => {
    if (isRetake) return { completed: false };
    return hasCompletedAssessment();
  }, [isRetake]);
  
  const localPriorAssessment = useMemo(() => {
    if (!completionCheck.completed) return null;
    return getLatestAssessment();
  }, [completionCheck.completed]);

  // Also check server for logged-in user's assessment (covers cross-device)
  const userEmail = user?.email || localStorage.getItem("assessment_guest_email") || undefined;
  const serverAssessment = trpc.assessment.getByEmail.useQuery(
    { email: userEmail! },
    { enabled: !isRetake && !localPriorAssessment && !!userEmail && !saved }
  );

  // Build the prior assessment from either local or server data
  const priorAssessment: PersistedAssessment | null = useMemo(() => {
    if (localPriorAssessment) return localPriorAssessment;
    if (serverAssessment.data) {
      return {
        assessmentId: serverAssessment.data.id,
        email: serverAssessment.data.guestEmail || userEmail || "",
        name: serverAssessment.data.guestName || user?.name || "You",
        role: serverAssessment.data.role,
        scores: (serverAssessment.data.scores as Record<string, number>) || {},
        domain: serverAssessment.data.domain || undefined,
        teamCode: undefined,
        shareToken: serverAssessment.data.shareToken || undefined,
        completedAt: serverAssessment.data.createdAt ? String(serverAssessment.data.createdAt) : new Date().toISOString(),
      };
    }
    return null;
  }, [localPriorAssessment, serverAssessment.data, userEmail, user?.name]);

  // Show returning dashboard if we have prior data (local or server)
  const [showReturningDashboard, setShowReturningDashboard] = useState(
    !isRetake && completionCheck.completed && !saved
  );

  // Also trigger dashboard when server data arrives
  useEffect(() => {
    if (!isRetake && !saved && !showReturningDashboard && priorAssessment && !localPriorAssessment) {
      setShowReturningDashboard(true);
    }
  }, [priorAssessment, isRetake, saved, showReturningDashboard, localPriorAssessment]);

  const [phase, setPhase] = useState<"intro" | "name" | "questions" | "birth" | "submitting" | "complete" | "invite360">(saved?.phase || "intro");
  const [inviteEmails, setInviteEmails] = useState<string[]>([""]);
  const [invitesSent, setInvitesSent] = useState(false);
  const [generatedInviteLinks, setGeneratedInviteLinks] = useState<{email: string; url: string}[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(saved?.assessmentId || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(saved?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<number, string | RankingAnswer>>(saved?.answers || {});
  const [guestName, setGuestName] = useState(saved?.guestName || "");
  const [guestEmail, setGuestEmail] = useState(saved?.guestEmail || "");
  const [birthData, setBirthData] = useState(saved?.birthData || { date: "", time: "", city: "" });
  const [submissionError, setSubmissionError] = useState("");

  // Generate a stable session seed once (persists across re-renders and page reloads)
  const [sessionSeed] = useState(() => saved?.sessionSeed || Math.floor(Math.random() * 2147483647));

  // Shuffle BOTH question order AND option order within each question per session.
  // Uses different seed offsets so question order and option order are independent.
  // This prevents pattern-matching ("Spark is always option 1") and order bias
  // ("the first question is always about ambiguity").
  const shuffledQuestions = useMemo(() => {
    // First: shuffle the question order itself
    const questionOrder = seededShuffle(surveyQuestions, sessionSeed);
    // Then: shuffle options within each question using a different seed per question
    return questionOrder.map((q, idx) => ({
      ...q,
      options: seededShuffle(q.options, sessionSeed * 31 + q.id * 7919 + idx)
    }));
  }, [sessionSeed]);

  // Save session to localStorage whenever key state changes
  const saveSession = useCallback(() => {
    const session: SavedSession = {
      phase,
      currentQuestionIndex,
      answers,
      guestName,
      guestEmail,
      birthData,
      sessionSeed,
      assessmentId,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }, [phase, currentQuestionIndex, answers, guestName, guestEmail, birthData, sessionSeed, assessmentId]);

  useEffect(() => {
    // Don't save intro phase (let them see the intro fresh)
    // Don't save submitting phase (transient)
    if (phase !== "intro" && phase !== "submitting") {
      saveSession();
    }
  }, [phase, currentQuestionIndex, answers, guestName, guestEmail, saveSession]);

  // Clear session after successful submission and viewing results
  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
  }, []);

  // Handle Soulprint retake — jump directly to birth data step
  useEffect(() => {
    const soulprintRetake = localStorage.getItem("fc_soulprint_retake");
    if (soulprintRetake === "true") {
      localStorage.removeItem("fc_soulprint_retake");
      // Load existing answers if available
      const storedResults = localStorage.getItem("assessment_results");
      const storedName = localStorage.getItem("assessment_guest_name") || localStorage.getItem("assessment_name");
      if (storedResults && storedName) {
        setAnswers(JSON.parse(storedResults));
        setGuestName(storedName);
        setPhase("birth");
      }
    }
  }, []);

  // Capture team code and domain from URL if present
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const teamCode = searchParams.get("team");
  const domainParam = searchParams.get("domain");

  // Get team info if team code is present
  const { data: teamInfo } = trpc.team.getByCode.useQuery(
    { code: teamCode! },
    { enabled: !!teamCode }
  );

  const submitAssessment = trpc.assessment.submit.useMutation();
  const createInvites = trpc.peerReview.createInvites.useMutation();
  const generateReport = trpc.assessment.generateReport.useMutation();
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [reportGenerating, setReportGenerating] = useState(false);

  const currentQuestion = shuffledQuestions[currentQuestionIndex] ?? shuffledQuestions[shuffledQuestions.length - 1];
  const progress = ((Math.min(currentQuestionIndex, shuffledQuestions.length - 1) + 1) / shuffledQuestions.length) * 100;

  // Legacy single-select handler (kept for backward compatibility)
  const handleAnswerLegacy = (answerText: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerText }));

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      setPhase("birth");
    }
  };

  // Forced-rank handler: saves the full ranking array for each question
  const handleRankComplete = (ranking: { role: string; text: string }[]) => {
    const rankingAnswer: RankingAnswer = ranking.map(r => ({ role: r.role as any, text: r.text }));
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: rankingAnswer }));

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 400);
    } else {
      setPhase("birth");
    }
  };

  const handleBirthDataSubmit = (skip: boolean = false) => {
    if (!skip) {
      localStorage.setItem("assessment_birth_data", JSON.stringify(birthData));
    }
    handleFinalSubmit(skip ? undefined : birthData);
  };

  const handleFinalSubmit = async (birth?: { date: string; time: string; city: string }) => {
    setPhase("submitting");
    setSubmissionError("");

    const scores = calculateRoleScores(answers);
    const dominantRole = getDominantRole(scores);

    // Log locally for validation
    logAssessmentData({
      timestamp: new Date().toISOString(),
      sessionId: crypto.randomUUID(),
      answers,
      scores,
      dominantRole: dominantRole.role,
      birthData: birth,
      teamId: teamCode || undefined,
    });

    // Save to localStorage for results page
    localStorage.setItem("assessment_results", JSON.stringify(answers));
    localStorage.setItem("assessment_guest_name", guestName);
    localStorage.setItem("assessment_dominant_role", dominantRole.role);
    localStorage.setItem("assessment_role_scores", JSON.stringify(scores));
    localStorage.setItem("assessment_name", guestName);
    if (guestEmail) localStorage.setItem("assessment_guest_email", guestEmail);

    try {
      // Auto-extract domain from email
      const emailDomain = guestEmail ? guestEmail.split("@")[1]?.toLowerCase() : undefined;
      const effectiveDomain = domainParam || emailDomain;

      const result = await submitAssessment.mutateAsync({
        teamCode: teamCode || undefined,
        domain: effectiveDomain || undefined,
        guestName,
        guestEmail: guestEmail || undefined,
        role: dominantRole.role,
        score: dominantRole.score,
        scores,
        answers,
        birthDate: birth?.date || undefined,
        birthTime: birth?.time || undefined,
        birthCity: birth?.city || undefined,
      });

      // Save the share token and assessment ID
      if (result) {
        localStorage.setItem("assessment_share_token", result.shareToken ?? "");
        localStorage.setItem("assessment_id", String(result.id));
        if (teamCode) {
          localStorage.setItem("assessment_team_code", teamCode);
          localStorage.setItem("assessment_team_id", String(result.teamId ?? ""));
        }
        if (effectiveDomain) {
          localStorage.setItem("assessment_domain", effectiveDomain);
          localStorage.setItem("assessment_team_id", String(result.teamId ?? ""));
        }
        setAssessmentId(result.id);

        // Fix #1 & #2: Persist assessment to history and mark completed
        saveAssessmentToHistory({
          assessmentId: result.id,
          email: guestEmail,
          name: guestName,
          role: dominantRole.role,
          scores,
          domain: effectiveDomain || undefined,
          teamCode: teamCode || undefined,
          teamId: result.teamId ? String(result.teamId) : undefined,
          shareToken: result.shareToken || undefined,
          completedAt: new Date().toISOString(),
        });
        if (guestEmail) {
          markAssessmentCompleted(guestEmail, result.id);
        }
        // Also mark generic completion for non-email checks
        markAssessmentCompleted("__generic__", result.id);
      }

      // Go to 360 invite phase instead of complete
      setPhase("invite360");
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to submit. Please try again.");
      setPhase("birth"); // Go back to let them retry
    }
  };

  // ─── Loading state: checking server for prior assessment ──────────
  if (!isRetake && !saved && !localPriorAssessment && !!userEmail && serverAssessment.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
        <p className="text-gray-400">Loading your results...</p>
      </div>
    );
  }

  // ─── Phase: Returning User Dashboard ───────────────────────────────
  if (showReturningDashboard && priorAssessment) {
    const roleColorMap: Record<string, string> = {
      Spark: "text-amber-400",
      Amplifier: "text-red-400",
      Filter: "text-violet-400",
      Ground: "text-blue-400",
      Conductor: "text-emerald-400",
    };
    const roleBgMap: Record<string, string> = {
      Spark: "bg-amber-500/20 border-amber-500/30",
      Amplifier: "bg-red-500/20 border-red-500/30",
      Filter: "bg-violet-500/20 border-violet-500/30",
      Ground: "bg-blue-500/20 border-blue-500/30",
      Conductor: "bg-emerald-500/20 border-emerald-500/30",
    };
    const roleDescMap: Record<string, string> = {
      Spark: "You ignite ideas and see what others can't yet.",
      Amplifier: "You build momentum and rally belief in the vision.",
      Filter: "You stress-test plans and refine them to excellence.",
      Ground: "You execute with precision and deliver results.",
      Conductor: "You orchestrate the flow between all roles.",
    };
    const teamInviteLink = priorAssessment.teamCode
      ? `${window.location.origin}/assessment?team=${priorAssessment.teamCode}`
      : priorAssessment.domain
        ? `${window.location.origin}/assessment?domain=${priorAssessment.domain}`
        : `${window.location.origin}/assessment`;

    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <p className="text-sm uppercase tracking-widest text-gray-400">Welcome back, {priorAssessment.name}</p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              You are a <span className={roleColorMap[priorAssessment.role] || "text-yellow-400"}>{priorAssessment.role}</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto">
              {roleDescMap[priorAssessment.role] || "Your natural energy role has been identified."}
            </p>
          </motion.div>

          {/* Score Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Your Energy Distribution</h2>
            {Object.entries(priorAssessment.scores || {}).sort(([,a], [,b]) => (b as number) - (a as number)).map(([role, score]) => (
              <div key={role} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={roleColorMap[role] || "text-gray-300"}>{role}</span>
                  <span className="text-gray-400">{score as number}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      role === priorAssessment.role ? "bg-yellow-400" : "bg-white/30"
                    }`}
                    style={{ width: `${Math.min(((score as number) / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </motion.div>

          {/* 360 Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ThreeSixtyLinkGenerator
              assessmentId={Number(priorAssessment.assessmentId)}
              subjectName={priorAssessment.name}
              subjectEmail={priorAssessment.email}
              selfScores={priorAssessment.scores}
              domain={priorAssessment.domain}
            />
          </motion.div>

          {/* Share with Teammates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-5 h-5 text-yellow-400" /> Share With Your Team
            </h2>
            <p className="text-gray-300">
              Send this link to your teammates so they can take the assessment
              and join your team map.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={teamInviteLink}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-gray-200 font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                onClick={() => {
                  navigator.clipboard.writeText(teamInviteLink);
                }}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </div>
          </motion.div>

          {/* View Full Results + Retake */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Button
              size="lg"
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold text-lg px-8"
              onClick={() => navigate("/results")}
            >
              View Full Results <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => {
                setShowReturningDashboard(false);
              }}
            >
              Retake Assessment
            </Button>
          </motion.div>

          {/* Completed date */}
          <p className="text-center text-sm text-gray-500">
            Completed {new Date(priorAssessment.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    );
  }

  // ─── Phase: Intro ────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full text-center space-y-8 relative z-10"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-400 text-black p-4 rounded-full">
              <BrainCircuit className="w-12 h-12" />
            </div>
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            The Flow Circuit<br />Assessment
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Discover your innate operational energy — the role you were <em>born</em> to play in any team.
          </p>

          {teamInfo && (
            <div className="bg-blue-900/30 border border-blue-400/30 p-4 rounded-xl">
              <p className="text-blue-200 text-lg">
                You are joining <strong className="text-white">{teamInfo.name}</strong>
                {teamInfo.companyName && <span> at {teamInfo.companyName}</span>}
              </p>
            </div>
          )}

          {domainParam && !teamInfo && (
            <div className="bg-emerald-900/30 border border-emerald-400/30 p-4 rounded-xl">
              <p className="text-emerald-200 text-lg">
                You are joining the <strong className="text-white">{domainParam}</strong> team.
                Your results will be added to the team map.
              </p>
            </div>
          )}

          {/* ── Intention Setting ── */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 rounded-2xl text-left space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Before You Begin: Set Your Intention
            </h2>
            <div className="space-y-4 text-base md:text-lg text-gray-200 leading-relaxed">
              <p>
                This is not a personality test. This is a <strong className="text-white">signal detection</strong> — designed to find the energy you carry <em>naturally</em>, not the one your job title forces you into.
              </p>
              <p>
                Think about how you showed up as a <strong className="text-white">child</strong>. Were you the one who started the game, or the one who made sure everyone played fair? Did you get excited telling everyone about the idea, or did you quietly build the fort while others talked? That instinct — that first impulse — is what we're looking for.
              </p>
              <p className="text-white font-bold text-lg md:text-xl border-l-4 border-yellow-400 pl-4 py-2 bg-white/5">
                Answer from your innate superpower — who you are when no one is watching, when nothing is at stake, when you are simply <em>in flow</em>.
              </p>
            </div>
          </div>

          {/* ── Framework Rules ── */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl text-left space-y-5">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest">
              The Protocol
            </h2>
            <div className="space-y-3 text-base md:text-lg text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-black text-xl mt-0.5">01</span>
                <p><strong className="text-white">Rank, don't pick.</strong> For each question, you'll see five responses. Drag them into order from "most like me" at the top to "least like me" at the bottom. Every response gets a position — no ties, no skipping.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-black text-xl mt-0.5">02</span>
                <p><strong className="text-white">Go with your gut.</strong> Your first instinct is the right one. If you deliberate, you're answering from your job, not your core. Speed is accuracy here.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-black text-xl mt-0.5">03</span>
                <p><strong className="text-white">Answer for YOU, not your role.</strong> Forget your title, your KPIs, your boss's expectations. This is about the human underneath.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-black text-xl mt-0.5">04</span>
                <p><strong className="text-white">Every role matters.</strong> There are no wrong answers. The circuit doesn't work without all five energies. The ranking just reveals your <em>distribution</em>.</p>
              </div>
            </div>
          </div>

          {/* ── What to Expect ── */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl text-left space-y-5">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest">
              What to Expect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-5 space-y-2">
                <div className="text-3xl font-black text-yellow-400">12</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-bold">Questions</div>
                <p className="text-xs text-gray-500">Forced-rank: drag to order, not pick one</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 space-y-2">
                <div className="text-3xl font-black text-yellow-400">~8 min</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-bold">To Complete</div>
                <p className="text-xs text-gray-500">Go with your gut — speed is accuracy here</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 space-y-2">
                <div className="text-3xl font-black text-yellow-400">Your Role</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-bold">Revealed</div>
                <p className="text-xs text-gray-500">Spark, Amplifier, Filter, Ground, or Conductor</p>
              </div>
            </div>
          </div>

          {/* ── What You Get ── */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl text-left space-y-5">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-widest">
              What You Get
            </h2>
            <div className="space-y-3 text-base md:text-lg text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">⚡</span>
                <p><strong className="text-white">Your Dominant Energy Profile</strong> — which of the five Flow Circuit roles you naturally carry, with a percentage breakdown across all five.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 text-xl">📊</span>
                <p><strong className="text-white">A Personal Report</strong> — your strengths, your friction points, and how to operate at your highest level.</p>
              </div>
              {(domainParam || teamCode) && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">🗺️</span>
                  <p><strong className="text-white">Your Team Map</strong> — see where you land on the team's energy grid. Identify gaps, overlaps, and friction points across the entire group. Learn who to hand the baton to, and who should never be in the same lane.</p>
                </div>
              )}
              {!(domainParam || teamCode) && (
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">🗺️</span>
                  <p><strong className="text-white">Team Mapping (Optional)</strong> — after your individual results, invite your team. Enter your company domain and everyone's results get mapped together — revealing the real dynamics, the friction, and the flow.</p>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={() => setPhase("name")}
            className="w-full md:w-auto px-12 py-8 text-2xl font-black uppercase tracking-widest bg-yellow-400 text-black hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.3)]"
          >
            Begin the Assessment <ArrowRight className="ml-2 w-6 h-6" />
          </Button>

          <p className="text-sm text-gray-600">
            No login required. Your data is used only for your report.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Phase: Name Collection ──────────────────────────────────
  if (phase === "name") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full space-y-8 relative z-10"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Identity Lock</h2>
            <p className="text-gray-400 text-lg">
              Before we begin, we need to know who you are.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4" /> Your Full Name *
              </Label>
              <Input
                type="text"
                placeholder="e.g. Sarah Chen"
                className="bg-black/50 border-white/20 text-white h-12 text-lg"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Work Email *
              </Label>
              <Input
                type="email"
                placeholder="e.g. sarah@company.com"
                className="bg-black/50 border-white/20 text-white h-12"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <p className="text-xs text-gray-400">Required. Your email domain determines your team (e.g. @ramprate.com = RampRate team). You must verify your email to access the team report.</p>
            </div>

            {/* Live domain detection banner */}
            <AnimatePresence>
              {(() => {
                const emailMatch = guestEmail.match(/@([^\s@]+\.[^\s@]+)$/);
                const detectedDomain = emailMatch ? emailMatch[1].toLowerCase() : null;
                const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com'];
                const isCompanyEmail = detectedDomain && !freeEmailDomains.includes(detectedDomain);
                const companyName = isCompanyEmail ? detectedDomain.split('.')[0].charAt(0).toUpperCase() + detectedDomain.split('.')[0].slice(1) : null;

                if (!isCompanyEmail) return null;

                return (
                  <motion.div
                    key="team-detect"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">{companyName} Detected</span>
                      </div>
                      <p className="text-yellow-200/80 text-xs leading-relaxed">
                        Your results will automatically join the <strong className="text-yellow-300">{companyName} Team Map</strong>. 
                        Everyone with an @{detectedDomain} email is mapped together — individual results stay private, 
                        but the team's energy distribution is visible to all members.
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-yellow-400/70" />
                          <span className="text-[10px] text-yellow-300/70 uppercase tracking-wider">Individual + Team Assessment</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            <Button
              onClick={() => setPhase("questions")}
              disabled={!guestName.trim() || !guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)}
              className="w-full bg-yellow-400 text-black hover:bg-white h-14 text-xl font-bold uppercase tracking-widest"
            >
              Proceed <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Phase: Birth Data (Soulprint — Optional & Fun) ─────────
  if (phase === "birth") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full space-y-8 relative z-10"
        >
          {/* Header — clearly optional */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-4 py-1.5 rounded-full text-sm text-purple-300 font-medium">
              <span>✨</span> Optional — just for fun
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Unlock Your Soulprint</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Want to go deeper? Add your birth data and we'll layer in a whole new dimension.
            </p>
          </div>

          {submissionError && (
            <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg text-red-200">
              {submissionError}
            </div>
          )}

          {/* What IS Soulprint — explain before asking */}
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/20 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-purple-300">What is a Soulprint?</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your <strong className="text-white">Soulprint</strong> is a multi-framework personality map that synthesizes <strong className="text-white">8 different systems</strong> — Enneagram, Human Design, Gene Keys, Western Astrology, Vedic Astrology, Chinese Astrology, Spiral Dynamics, and Numerology — into a single, unified archetype profile.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              Think of it as the "cosmic fingerprint" that sits underneath your Flow Circuit role. Your Flow Circuit tells you <em>what you do</em> on a team. Your Soulprint tells you <em>why you do it that way</em>.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mt-2">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-yellow-400">Coming soon:</strong> The full Soulprint report is being wired up now and will be seamlessly integrated into your Flow Circuit results in the next couple of weeks. If you enter your birth data now, your Soulprint will be waiting for you when it launches — no need to retake anything.
              </p>
            </div>
          </div>

          {/* Birth data form */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
            <p className="text-sm text-gray-400">All three fields are needed to generate an accurate Soulprint. Don't know your birth time? That's okay — skip this step and come back later.</p>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </Label>
                <Input
                  type="date"
                  className="bg-black/50 border-white/20 text-white h-12"
                  value={birthData.date}
                  onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Time of Birth
                  </Label>
                  <Input
                    type="time"
                    className="bg-black/50 border-white/20 text-white h-12"
                    value={birthData.time}
                    onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                  />
                  <p className="text-[10px] text-gray-500">As close as you can remember</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> City of Birth
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. London, UK"
                    className="bg-black/50 border-white/20 text-white h-12"
                    value={birthData.city}
                    onChange={(e) => setBirthData({ ...birthData, city: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => handleBirthDataSubmit(false)}
                className="w-full bg-purple-500 text-white hover:bg-purple-400 h-12 text-lg font-bold"
                disabled={!birthData.date || !birthData.time || !birthData.city}
              >
                Save My Soulprint Data ✨
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleBirthDataSubmit(true)}
                className="w-full text-gray-400 hover:text-white h-12 text-base"
              >
                Skip — just show me my Flow Circuit results
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Phase: Submitting ───────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold">Calculating your operational physics...</h2>
          <p className="text-gray-400">Syncing with the Flow Circuit database.</p>
        </motion.div>
      </div>
    );
  }

  // ─── Phase: 360 Invite ───────────────────────────────────────
  if (phase === "invite360") {
    const emailDomain = guestEmail ? guestEmail.split("@")[1]?.toLowerCase() : "";

    const handleAddEmail = () => {
      if (inviteEmails.length < 10) {
        setInviteEmails([...inviteEmails, ""]);
      }
    };

    const handleRemoveEmail = (idx: number) => {
      setInviteEmails(inviteEmails.filter((_, i) => i !== idx));
    };

    const handleSendInvites = async () => {
      const validEmails = inviteEmails.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (validEmails.length === 0 || !assessmentId) return;

      try {
        const result = await createInvites.mutateAsync({
          assessmentId,
          targetName: guestName,
          reviewerEmails: validEmails,
          origin: window.location.origin,
        });
        setGeneratedInviteLinks(result.invites.map(i => ({ email: i.email, url: i.inviteUrl })));
        setInvitesSent(true);
      } catch (err) {
        console.error("Failed to send invites", err);
      }
    };

    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full space-y-8 relative z-10"
        >
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Assessment Complete!</h2>
            <p className="text-gray-300 text-lg">
              Now let's get your 360° view, <strong className="text-white">{guestName}</strong>.
            </p>
          </div>

          {/* PDF Report Download */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 md:p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Your Flow Circuit Report</h3>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  A personalized PDF with your results, resonance guide, and 360° invite template.
                </p>
              </div>
              <Button
                onClick={async () => {
                  if (reportUrl) {
                    window.open(reportUrl, '_blank');
                    return;
                  }
                  if (!assessmentId || reportGenerating) return;
                  setReportGenerating(true);
                  try {
                    const result = await generateReport.mutateAsync({
                      assessmentId,
                      origin: window.location.origin,
                    });
                    setReportUrl(result.url);
                    window.open(result.url, '_blank');
                  } catch (err) {
                    console.error('Failed to generate report', err);
                  } finally {
                    setReportGenerating(false);
                  }
                }}
                disabled={reportGenerating || !assessmentId}
                className="bg-yellow-400 text-black hover:bg-white font-bold px-6 h-10 shrink-0"
              >
                {reportGenerating ? 'Generating...' : reportUrl ? 'Download PDF' : 'Get Your PDF'}
              </Button>
            </div>
          </div>

          {!invitesSent ? (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-widest">Invite Your 360° Reviewers</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  How do others see you? Invite colleagues, managers, or direct reports to share their perception of your Flow Circuit role. 
                  Their responses are anonymous and will reveal the gap between how you see yourself and how others experience you.
                </p>
              </div>

              <div className="space-y-3">
                {inviteEmails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={`colleague${idx + 1}@${emailDomain || 'company.com'}`}
                      className="bg-black/50 border-white/20 text-white h-10 flex-1"
                      value={email}
                      onChange={(e) => {
                        const updated = [...inviteEmails];
                        updated[idx] = e.target.value;
                        setInviteEmails(updated);
                      }}
                    />
                    {inviteEmails.length > 1 && (
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveEmail(idx)}
                        className="text-gray-500 hover:text-red-400 px-2"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                {inviteEmails.length < 10 && (
                  <Button
                    variant="ghost"
                    onClick={handleAddEmail}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    + Add another reviewer
                  </Button>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleSendInvites}
                  disabled={!inviteEmails.some(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) || createInvites.isPending}
                  className="w-full bg-yellow-400 text-black hover:bg-white h-12 text-lg font-bold uppercase tracking-widest"
                >
                  {createInvites.isPending ? "Sending..." : "Send 360° Invites"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPhase("complete")}
                  className="text-gray-500 hover:text-white"
                >
                  Skip for now → View my results
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md border border-green-500/30 p-6 md:p-8 rounded-2xl space-y-6">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-400">360° Links Generated!</h3>
                <p className="text-gray-300 text-sm mt-2">
                  Share these links with your reviewers. Their anonymous feedback will reveal how others experience your energy.
                </p>
              </div>

              <div className="space-y-3">
                {generatedInviteLinks.map((link, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-1">
                    <p className="text-xs text-gray-400">{link.email}</p>
                    <div className="flex gap-2 items-center">
                      <input
                        readOnly
                        value={link.url}
                        className="bg-transparent text-white text-xs flex-1 outline-none truncate"
                      />
                      <Button
                        variant="ghost"
                        className="text-yellow-400 hover:text-white text-xs px-2 py-1 h-auto shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(link.url);
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  const allLinks = generatedInviteLinks.map(l => `${l.email}: ${l.url}`).join('\n');
                  navigator.clipboard.writeText(allLinks);
                }}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 h-10"
              >
                Copy All Links
              </Button>

              <Button
                onClick={() => setPhase("complete")}
                className="w-full bg-yellow-400 text-black hover:bg-white h-12 text-lg font-bold uppercase tracking-widest"
              >
                View My Results <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Phase: Complete ─────────────────────────────────────────
  if (phase === "complete") {
    const emailDomain = guestEmail ? guestEmail.split("@")[1]?.toLowerCase() : "";
    const effectiveDomain = domainParam || emailDomain;
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com', 'zoho.com', 'yandex.com'];
    const isCompanyEmail = effectiveDomain && !freeEmailDomains.includes(effectiveDomain);
    const companyName = isCompanyEmail ? effectiveDomain.split('.')[0].charAt(0).toUpperCase() + effectiveDomain.split('.')[0].slice(1) : null;

    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <div className="flex justify-center">
            <CheckCircle2 className="w-24 h-24 text-green-600" />
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Data Captured</h1>
          <p className="text-xl text-gray-600">
            Your intuitive signal has been recorded and synced, <strong>{guestName}</strong>. We are now calculating your operational physics.
          </p>

          {/* Company team auto-join confirmation */}
          {isCompanyEmail && companyName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">{companyName} Team Joined</span>
              </div>
              <p className="text-sm text-yellow-700 leading-relaxed">
                Your individual results and team contribution have been recorded simultaneously. 
                View your personal Flow Circuit report, or jump straight to the <strong>{companyName} Team Map</strong> to 
                see how your team's energy is distributed.
              </p>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => { clearSession(); navigate("/results"); }}
              className="px-8 py-6 text-xl font-bold uppercase bg-black text-white hover:bg-gray-800"
            >
              View Your Results
            </Button>
            {effectiveDomain && (
              <Button
                onClick={() => { clearSession(); navigate(`/team-map?domain=${encodeURIComponent(effectiveDomain)}`); }}
                variant="outline"
                className={`px-8 py-6 text-xl font-bold uppercase border-2 ${isCompanyEmail ? 'border-yellow-500 text-yellow-700 hover:bg-yellow-500 hover:text-white' : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                <Users className="mr-2 w-5 h-5" />
                {isCompanyEmail ? `${companyName} Team Map` : 'View Team Map'}
              </Button>
            )}
          </div>
          {effectiveDomain && !isCompanyEmail && (
            <p className="text-sm text-gray-500">
              Your results have been added to the <strong>{effectiveDomain}</strong> team map.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // ─── Phase: Questions (Forced-Rank Stacked Queue) ───────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 bg-white/10 w-full flex-shrink-0">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-4 md:px-8 md:py-6 overflow-y-auto">
        <div className="max-w-6xl w-full flex flex-col flex-1">
          {/* Question Counter */}
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <span className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-white/40">
              {currentQuestionIndex + 1} / {shuffledQuestions.length}
            </span>
            <span className="text-sm font-mono text-white/30 font-bold">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Question Text + Ranking */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1"
            >
              <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black leading-[1.1] mb-4 md:mb-6 tracking-tight text-center" style={{ textWrap: 'balance' as any }}>
                {currentQuestion.text}
              </h2>

              <p className="text-center text-white/50 text-xs md:text-sm mb-4 md:mb-6 font-medium">
                Rank from <span className="text-emerald-400 font-bold">most like you</span> to <span className="text-red-400 font-bold">least like you</span>
              </p>

              <RankableQuestion
                key={`rank-q-${currentQuestion.id}`}
                questionId={currentQuestion.id}
                questionText={currentQuestion.text}
                options={currentQuestion.options}
                onRankComplete={handleRankComplete}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={shuffledQuestions.length}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
