"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import {
  calculateRoleScores,
  getDominantRole,
  getRolePercentages,
  getCombinationProfile,
} from "@/lib/surveyData";
import {
  Zap, Target, Shield, Sparkles, Brain,
  Briefcase, Home, User, RefreshCw, Lock,
  ArrowRight, ChevronRight
} from "lucide-react";

type CoachingContext = "work" | "family" | "personal";

const contextConfig: Record<CoachingContext, { label: string; icon: typeof Briefcase; description: string }> = {
  work: { label: "Work", icon: Briefcase, description: "Optimize your role in professional teams" },
  family: { label: "Family", icon: Home, description: "Navigate family dynamics with awareness" },
  personal: { label: "Personal", icon: User, description: "Grow toward your best self" },
};

const categoryConfig: Record<string, { label: string; icon: typeof Zap; color: string; bg: string }> = {
  leverage: { label: "Leverage", icon: Zap, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  stretch: { label: "Stretch", icon: Target, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  protect: { label: "Protect", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
};

export default function Coaching() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [context, setContext] = useState<CoachingContext>("work");

  // Load assessment data from localStorage
  const selfData = useMemo(() => {
    const stored = localStorage.getItem("assessment_self_answers");
    if (!stored) return null;
    try {
      const answers = JSON.parse(stored);
      const scores = calculateRoleScores(answers);
      const dominant = getDominantRole(scores);
      return { answers, scores, dominant };
    } catch {
      return null;
    }
  }, []);

  const rolePercentages = useMemo(() => {
    if (!selfData) return [];
    return getRolePercentages(selfData.scores);
  }, [selfData]);

  const combinationProfile = useMemo(() => {
    if (!selfData) return null;
    return getCombinationProfile(selfData.scores);
  }, [selfData]);

  const generateMutation = trpc.coaching.generate.useMutation();

  const handleGenerate = () => {
    if (!selfData || !combinationProfile) return;
    generateMutation.mutate({
      role: selfData.dominant.role,
      combinationProfile: combinationProfile.label,
      purityScore: combinationProfile.purityScore,
      percentages: rolePercentages.map(p => ({ role: p.role, percentage: p.percentage })),
      context,
    });
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              Coaching prompts are personalized to your Flow Circuit profile.
              Sign in to access your weekly coaching.
            </p>
            <Button onClick={() => window.location.href = "/login"} className="bg-black text-white">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No assessment data
  if (!selfData || !combinationProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Take the Assessment First</h2>
            <p className="text-gray-600 mb-6">
              Your coaching prompts are generated from your Flow Circuit profile.
              Complete the assessment to unlock personalized coaching.
            </p>
            <Button onClick={() => router.push("/assessment")} className="bg-black text-white">
              Take the Assessment <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prompts = generateMutation.data?.prompts || [];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <section className="border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Weekly Coaching
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Your Coaching Prompts
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Personalized actions based on your <strong>{combinationProfile.label}</strong> profile
              ({combinationProfile.purityScore}% purity). Three prompts to leverage your strengths,
              stretch your growth edge, and protect against burnout.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Context Selector */}
      <section className="border-b bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-gray-500">Context:</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(Object.entries(contextConfig) as [CoachingContext, typeof contextConfig.work][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setContext(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    context === key
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {contextConfig[context].description}
          </p>
        </div>
      </section>

      {/* Generate Button */}
      <section className="border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 text-center">
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="bg-black text-white px-8 py-3 text-base"
            size="lg"
          >
            {generateMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Prompts...
              </>
            ) : prompts.length > 0 ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Prompts
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate This Week's Coaching
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Coaching Prompts */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <AnimatePresence mode="wait">
            {prompts.length > 0 ? (
              <motion.div
                key="prompts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {prompts.map((prompt: { title: string; prompt: string; category: string }, i: number) => {
                  const cat = categoryConfig[prompt.category] || categoryConfig.leverage;
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <Card className={`border-2 ${cat.bg}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 ${cat.color}`} />
                              <span className={`text-xs font-bold uppercase tracking-wider ${cat.color}`}>
                                {cat.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">Prompt {i + 1} of 3</span>
                          </div>
                          <CardTitle className="text-lg font-bold mt-1">{prompt.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 leading-relaxed">{prompt.prompt}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                <div className="text-center pt-6 text-sm text-gray-500">
                  <p>These prompts are tailored to your {combinationProfile.label} profile in a {context} context.</p>
                  <p className="mt-1">Regenerate anytime for fresh perspective.</p>
                </div>
              </motion.div>
            ) : !generateMutation.isPending ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  Ready When You Are
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Click "Generate This Week's Coaching" above to get three
                  personalized action prompts based on your Flow Circuit profile.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <h2 className="text-xl font-bold mb-6 text-center">How Coaching Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Leverage", desc: "Actions that lean into your natural strengths. Do more of what comes naturally — this is where your highest ROI lives.", color: "text-amber-600" },
              { icon: Target, title: "Stretch", desc: "Gentle growth toward your secondary role. Build capacity without burning out. Small steps, big compound returns.", color: "text-blue-600" },
              { icon: Shield, title: "Protect", desc: "Guard against operating outside your nature. Recognize the stress signals and create boundaries that preserve your energy.", color: "text-emerald-600" },
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color}`} />
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
