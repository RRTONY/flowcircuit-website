"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Compass, Zap, Shield, Radio, Target, Filter as FilterIcon,
  ArrowRight, Loader2, LogIn, Sparkles, Users, Brain, Heart,
  ExternalLink, CheckCircle2, Clock, TrendingUp
} from "lucide-react";

const roleEmoji: Record<string, string> = {
  Spark: "⚡", Amplifier: "📡", Filter: "🔬", Ground: "🏗️", Conductor: "🎯"
};
const roleColor: Record<string, string> = {
  Spark: "from-yellow-400 to-amber-500",
  Amplifier: "from-cyan-400 to-blue-500",
  Filter: "from-rose-400 to-pink-500",
  Ground: "from-emerald-400 to-green-500",
  Conductor: "from-purple-400 to-violet-500",
};
const roleBorder: Record<string, string> = {
  Spark: "border-yellow-500/30",
  Amplifier: "border-cyan-500/30",
  Filter: "border-rose-500/30",
  Ground: "border-emerald-500/30",
  Conductor: "border-purple-500/30",
};

export default function MyJourneyClient() {
  const { user, isAuthenticated, loading } = useAuth();
  const assessmentsQuery = trpc.assessment.myResults.useQuery(undefined, { enabled: isAuthenticated });
  const teamsQuery = trpc.team.myTeams.useQuery(undefined, { enabled: isAuthenticated });

  const latestAssessment = useMemo(() => {
    if (!assessmentsQuery.data || assessmentsQuery.data.length === 0) return null;
    return assessmentsQuery.data[0];
  }, [assessmentsQuery.data]);

  const allScores = useMemo(() => {
    if (!latestAssessment?.scores) return null;
    return latestAssessment.scores as Record<string, number>;
  }, [latestAssessment]);

  const topRole = latestAssessment?.role || null;
  const secondaryRole = useMemo(() => {
    if (!allScores || !topRole) return null;
    let best = "";
    let bestScore = -1;
    for (const [role, score] of Object.entries(allScores)) {
      if (role !== topRole && score > bestScore) {
        best = role;
        bestScore = score;
      }
    }
    return best;
  }, [allScores, topRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-20">
        <section className="py-32 px-4 text-center">
          <Compass className="w-16 h-16 text-blue-400 mx-auto mb-8" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">Your Journey Awaits</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
            Sign in to see your Flow Circuit results, team connections, SoulPrint status,
            and every tool you've explored — all in one place.
          </p>
          <a href="/login">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8">
              <LogIn className="w-4 h-4 mr-2" /> Sign In to Begin
            </Button>
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                {user?.name ? `${user.name}'s Journey` : "Your Journey"}
              </h1>
              <p className="text-muted-foreground text-sm">Your self-discovery command center</p>
            </div>
          </div>

          {/* Assessment Results Card */}
          {assessmentsQuery.isLoading ? (
            <div className="bg-card/50 rounded-2xl border border-border p-12 text-center mb-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-3" />
              <p className="text-muted-foreground">Loading your results...</p>
            </div>
          ) : latestAssessment ? (
            <div className={`bg-card/50 rounded-2xl border ${roleBorder[topRole || "Spark"]} p-8 mb-8`}>
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold">Your Energy DNA</h2>
                <span className="text-xs text-muted-foreground ml-auto">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(latestAssessment.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Primary Role */}
                <div className="text-center md:text-left">
                  <div className="text-5xl mb-3">{roleEmoji[topRole || "Spark"]}</div>
                  <h3 className="text-2xl font-bold mb-1">
                    <span className={`bg-clip-text text-transparent bg-gradient-to-r ${roleColor[topRole || "Spark"]}`}>
                      {topRole}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">Primary Role · Score: {latestAssessment.score}</p>
                  {secondaryRole && (
                    <p className="text-xs text-muted-foreground">
                      Secondary: {roleEmoji[secondaryRole]} {secondaryRole} ({allScores?.[secondaryRole]})
                    </p>
                  )}
                </div>

                {/* Score Bars */}
                <div className="space-y-2">
                  {allScores && Object.entries(allScores)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([role, score]) => {
                      const maxScore = Math.max(...Object.values(allScores as Record<string, number>));
                      const pct = maxScore > 0 ? Math.round(((score as number) / maxScore) * 100) : 0;
                      return (
                        <div key={role} className="flex items-center gap-3">
                          <span className="w-6 text-center">{roleEmoji[role]}</span>
                          <span className="w-20 text-xs text-muted-foreground">{role}</span>
                          <div className="flex-1 h-5 bg-border/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${roleColor[role] || "from-gray-400 to-gray-500"} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs text-right font-mono">{score as number}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/50">
                <Link href="/results">
                  <Button variant="outline" size="sm">
                    Full Results <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
                <Link href="/share-card">
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" /> Share Card
                  </Button>
                </Link>
                <Link href="/relationship-calculator">
                  <Button variant="outline" size="sm">
                    <Heart className="w-3 h-3 mr-1" /> Relationship Calculator
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-card/50 rounded-2xl border border-border p-12 text-center mb-8">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Discover Your Energy DNA</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Take the 5-minute Flow Circuit assessment to reveal your primary role
                in the innovation relay.
              </p>
              <Link href="/assessment">
                <Button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
                  Take the Assessment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Teams */}
          <div className="bg-card/50 rounded-2xl border border-border p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">Your Teams</h2>
            </div>
            {teamsQuery.isLoading ? (
              <div className="text-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-blue-400 mx-auto" />
              </div>
            ) : teamsQuery.data && teamsQuery.data.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {teamsQuery.data.map((team: any) => (
                  <Link key={team.id} href={`/team/${team.id}`}>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-blue-500/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">Code: {team.code}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No teams yet. Create one or join with a team code.</p>
                <Link href="/assessment">
                  <Button variant="outline" size="sm">Create a Team</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Assessment History */}
          {assessmentsQuery.data && assessmentsQuery.data.length > 1 && (
            <div className="bg-card/50 rounded-2xl border border-border p-8 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold">Assessment History</h2>
              </div>
              <div className="space-y-3">
                {assessmentsQuery.data.map((a: any, i: number) => (
                  <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl bg-background/50 border border-border/50">
                    <span className="text-2xl">{roleEmoji[a.role] || "❓"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.role} · Score {a.score}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    {i === 0 && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full">Latest</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Explore More */}
          <div className="bg-card/50 rounded-2xl border border-border p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Compass className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">Continue Your Discovery</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "SoulPrint", desc: "Map your soul's inertia", href: "/soulprint", icon: "🌀", done: false },
                { title: "Magic Questions", desc: "10 questions before any project", href: "/magic-questions", icon: "✨", done: false },
                { title: "Conductor's Playbook", desc: "Lead the relay", href: "/conductor-playbook", icon: "🎼", done: false },
                { title: "Relationship Calculator", desc: "Two-person energy dynamics", href: "/relationship-calculator", icon: "💫", done: false },
                { title: "Enterprise Dashboard", desc: "Team circuit health", href: "/enterprise-dashboard", icon: "📊", done: false },
                { title: "Find Your Frequency", desc: "The full ecosystem", href: "/find-your-path", icon: "🔮", done: false },
                { title: "Identity Assessment", desc: "Find Your Me", href: "https://tonygreenb-gxhndhxp.manus.space/", icon: "🪞", external: true, done: false },
                { title: "The Amplifier", desc: "Scale your signal", href: "https://tonygreenb-gxhndhxp.manus.space/amplifier", icon: "📡", external: true, done: false },
                { title: "ImpactSoul", desc: "Impact at breakneck speed", href: "https://impactsoul.is", icon: "🌍", external: true, done: false },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium group-hover:text-blue-400 transition-colors">
                        {item.title}
                        {item.external && <ExternalLink className="w-3 h-3 inline ml-1 opacity-50" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    {item.done && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
