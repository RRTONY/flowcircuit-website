import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle2, Users, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { surveyQuestions, calculateRoleScores, getDominantRole } from "@/lib/surveyData";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

// Seeded shuffle for consistent randomization
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function PeerAssessment() {
  // Extract token from URL: /peer-review/:token
  const params = useParams<{ token: string }>();
  const token = params?.token || "";

  const [phase, setPhase] = useState<"loading" | "intro" | "questions" | "complete" | "error">("loading");
  const [reviewerName, setReviewerName] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [, setLocation] = useLocation();

  const [sessionSeed] = useState(() => Math.floor(Math.random() * 2147483647));

  const shuffledQuestions = useMemo(() => {
    return surveyQuestions.map(q => ({
      ...q,
      options: seededShuffle(q.options, sessionSeed + q.id)
    }));
  }, [sessionSeed]);

  // Fetch the peer review invite by token
  const { data: invite, isLoading, error } = trpc.peerReview.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const completeMutation = trpc.peerReview.complete.useMutation();

  // Determine phase based on data
  if (isLoading && phase === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
        <p className="mt-4 text-gray-400">Loading review...</p>
      </div>
    );
  }

  if (error || (!isLoading && !invite)) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Invalid Review Link</h1>
        <p className="text-gray-400 mb-6">This peer review link is invalid or has expired.</p>
        <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-gray-200">
          Go Home
        </Button>
      </div>
    );
  }

  if (invite?.completed) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Already Completed</h1>
        <p className="text-gray-400 mb-6">This peer review has already been submitted. Thank you!</p>
        <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-gray-200">
          Go Home
        </Button>
      </div>
    );
  }

  const targetName = invite?.targetName || "your colleague";
  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;

  const handleAnswer = (answerText: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerText }));

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 250);
    } else {
      // Calculate scores and submit
      const finalAnswers = { ...answers, [currentQuestion.id]: answerText };
      const scores = calculateRoleScores(finalAnswers);
      const dominant = getDominantRole(scores);

      completeMutation.mutate({
        token,
        reviewerName,
        perceivedRole: dominant.role,
        perceivedScores: scores,
        answers: finalAnswers,
      }, {
        onSuccess: () => setPhase("complete"),
        onError: (err) => {
          console.error("Failed to submit review", err);
          setPhase("error");
        }
      });
    }
  };

  // ─── Intro Phase ─────────────────────────────────────────────
  if (phase === "intro" || phase === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full text-center space-y-8 relative z-10"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500 text-white p-4 rounded-full">
              <Eye className="w-12 h-12" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            360° Peer Review
          </h1>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 md:p-8 rounded-2xl text-left space-y-6">
            <h2 className="text-xl font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-6 h-6" /> Observation Protocol
            </h2>
            <div className="space-y-4 text-base md:text-lg text-gray-200 leading-relaxed">
              <p>
                <strong className="text-white">{targetName}</strong> has completed their Flow Circuit assessment and wants to know how <em>you</em> perceive their energy.
              </p>
              <p>
                You'll answer the same 12 questions — but this time, answer based on how <strong>{targetName}</strong> actually shows up in the work. Not who they want to be. How they <em>are</em>.
              </p>
              <p className="text-sm text-gray-400">
                Your responses are anonymous. {targetName} will only see the aggregate perception, not your individual answers.
              </p>

              <div className="pt-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Your Name
                </label>
                <Input
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-black/50 border-white/30 text-white text-lg h-12 placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => reviewerName && setPhase("questions")}
            disabled={!reviewerName.trim()}
            className="w-full md:w-auto px-12 py-6 text-xl font-black uppercase tracking-widest bg-blue-500 text-white hover:bg-white hover:text-blue-600 transition-all duration-300 disabled:opacity-50"
          >
            Start Observation <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Complete Phase ──────────────────────────────────────────
  if (phase === "complete") {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6 max-w-2xl"
        >
          <div className="flex justify-center">
            <CheckCircle2 className="w-24 h-24 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Signal Locked</h1>
          <p className="text-lg md:text-xl text-gray-600">
            Your observation of <strong>{targetName}</strong> has been recorded. The perception gap will now be calculated and added to their Flow Circuit profile.
          </p>
          <p className="text-sm text-gray-400">
            Thank you, {reviewerName}. Your feedback is anonymous and helps {targetName} understand how others experience their energy.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="px-8 py-4 text-lg font-bold uppercase bg-black text-white hover:bg-gray-800"
          >
            Done
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── Error Phase ─────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Submission Failed</h1>
        <p className="text-gray-400 mb-6">Something went wrong. This review may have already been submitted.</p>
        <Button onClick={() => setLocation("/")} className="bg-white text-black hover:bg-gray-200">
          Go Home
        </Button>
      </div>
    );
  }

  // ─── Questions Phase ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200 w-full">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-8">
        <div className="max-w-3xl w-full space-y-4 md:space-y-6">

          {/* Question Header */}
          <div className="flex justify-between items-end border-b-2 border-blue-600 pb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Observing: <span className="text-black">{targetName}</span>
            </span>
            <span className="text-xs font-mono text-gray-400">
              {currentQuestionIndex + 1} / {shuffledQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg md:text-2xl font-bold leading-tight mb-4 md:mb-6">
                {currentQuestion.text.replace(/\byour\b/gi, `${targetName}'s`).replace(/\byou\b/gi, targetName)}
              </h2>

              <div className="grid gap-2 md:gap-3">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option.role}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleAnswer(option.text)}
                    className="group text-left py-3 px-4 border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm md:text-base font-medium">{option.text}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
